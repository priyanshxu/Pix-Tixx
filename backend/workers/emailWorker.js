import mongoose from "mongoose";
import dotenv from "dotenv";
import { consumer } from "../config/kafka.js";

import Bookings from "../models/Bookings.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Screen from "../models/Screen.js";
import Theatre from "../models/Theatre.js";

import { generateTicketPDF } from "../utils/generateTicket.js";
// Added sendResaleNotification import
import { sendTicketEmail, sendResaleNotification, sendResaleExpiryEmail } from "../utils/sendMail.js";

dotenv.config();

const runWorker = async () => {
    console.log("🚀 Worker Starting...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/pixtix");
    console.log("✅ Worker connected to MongoDB");

    await consumer.connect();
    await consumer.subscribe({ topic: 'ticket-bookings', fromBeginning: false });
    console.log("🎧 Worker listening for 'ticket-bookings'...");

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const eventData = JSON.parse(message.value.toString());
                console.log(`\n📨 Event Received: ${eventData.event}`);

                // --- CASE 1: Standard Booking OR Resale Buyer (They both need a PDF) ---
                if (eventData.event === 'BOOKING_CONFIRMED' || eventData.event === 'RESALE_BUYER_CONFIRMATION') {

                    const booking = await Bookings.findById(eventData.bookingId)
                        .populate("movie")
                        .populate({
                            path: "show",
                            populate: { path: "screen", populate: { path: "theatre" } }
                        });

                    const user = await User.findById(eventData.userId);

                    if (!booking || !user) {
                        console.error("❌ Data not found for booking/user. Skipping.");
                        return;
                    }

                    console.log("📄 Generating PDF...");
                    const pdfBuffer = await generateTicketPDF(booking, booking.movie, user);

                    const emailDetails = {
                        movieTitle: booking.movie.title,
                        date: booking.show.startTime,
                        seats: booking.seatNumber,
                        bookingId: booking._id.toString().slice(-6).toUpperCase(),
                        theatre: `${booking.show.screen.theatre.name}, ${booking.show.screen.name}`
                    };

                    console.log(`📧 Sending Ticket to ${user.email}...`);
                    await sendTicketEmail(user.email, emailDetails, pdfBuffer);
                    console.log("✅ Ticket sent!");
                }

                // --- CASE 2: Resale Seller Notification (They need a Payout Email) ---
                else if (eventData.event === 'RESALE_SELLER_NOTIFICATION') {
                    console.log(`💰 Sending Payout Notification to ${eventData.sellerEmail}...`);

                    // We expect the payload to have all details needed
                    await sendResaleNotification(
                        eventData.sellerEmail,
                        eventData.sellerName,
                        eventData.bookingDetails, // Object with movieTitle, seats, etc.
                        eventData.payout
                    );
                    console.log("✅ Payout Notification sent!");
                }
                else if (eventData.event === 'RESALE_EXPIRED') {
                    console.log(`⏳ Sending Expiry Notification to ${eventData.userEmail}...`);
                    await sendResaleExpiryEmail(
                        eventData.userEmail,
                        eventData.userName,
                        eventData.movieTitle,
                        eventData.showDate
                    );
                    console.log("✅ Expiry Email sent!");
                }

            } catch (err) {
                console.error("❌ Error processing message:", err);
            }
        },
    });
};

runWorker().catch(console.error);