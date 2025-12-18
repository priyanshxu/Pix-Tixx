import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectRabbitMQ } from "../config/rabbitmq.js";

import Bookings from "../models/Bookings.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Screen from "../models/Screen.js";
import Theatre from "../models/Theatre.js";

import { generateTicketPDF } from "../utils/generateTicket.js";
import { sendTicketEmail, sendResaleNotification, sendResaleExpiryEmail } from "../utils/sendMail.js";

dotenv.config();

const runWorker = async () => {
    console.log("🚀 Worker Starting...");

    // 1. Connect to MongoDB
    await mongoose.connect(`mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.7i3wdxl.mongodb.net/appName=Cluster0`);
    console.log("✅ Worker connected to MongoDB");

    // 2. Connect to RabbitMQ
    const channel = await connectRabbitMQ();
    const QUEUE_NAME = "ticket_notifications";

    if (!channel) {
        console.error("❌ Worker failed to connect to RabbitMQ. Exiting...");
        return;
    }

    console.log(`🎧 Worker listening on queue: ${QUEUE_NAME}...`);

    // 3. Consume Messages
    channel.consume(QUEUE_NAME, async (data) => {
        if (!data) return;

        try {
            const eventData = JSON.parse(data.content.toString());
            console.log(`\n📨 Event Received: ${eventData.event}`);

            // 🛑 CRITICAL FIX: Wait 2 seconds for DB to finish writing
            await new Promise(resolve => setTimeout(resolve, 6000));

            // --- CASE 1: Standard Booking OR Resale Buyer ---
            if (eventData.event === 'BOOKING_CONFIRMED' || eventData.event === 'RESALE_BUYER_CONFIRMATION') {

                console.log(`🔍 Fetching Booking ID: ${eventData.bookingId}`);

                const booking = await Bookings.findById(eventData.bookingId)
                    .populate("movie")
                    .populate({
                        path: "show",
                        populate: { path: "screen", populate: { path: "theatre" } }
                    });

                const userId = eventData.userId || (booking ? booking.user : null);
                const user = await User.findById(userId);

                if (!booking || !user) {
                    console.error("❌ Data still not found after wait. Skipping.");
                    channel.ack(data);
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

            // --- CASE 2: Resale Seller Notification ---
            else if (eventData.event === 'RESALE_SELLER_NOTIFICATION') {
                console.log(`💰 Sending Payout Notification to ${eventData.sellerEmail}...`);
                await sendResaleNotification(
                    eventData.sellerEmail,
                    eventData.sellerName,
                    eventData.bookingDetails,
                    eventData.payout
                );
                console.log("✅ Payout Notification sent!");
            }

            // --- CASE 3: Resale Expiry Notification ---
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

            // Mark as done
            channel.ack(data);

        } catch (err) {
            console.error("❌ Error processing message:", err);
            channel.ack(data);
        }
    });
};

runWorker().catch(console.error);