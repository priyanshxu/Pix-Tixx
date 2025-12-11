import Bookings from "../models/Bookings.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { generateTicketPDF } from "../utils/generateTicket.js";
import { sendTicketEmail, sendResaleNotification } from "../utils/sendMail.js"; 

// --- 1. LIST TICKET FOR SALE ---
export const listForResale = async (req, res) => {
    const { bookingId, userId } = req.body;

    try {
        const booking = await Bookings.findById(bookingId).populate("show");
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.user.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });
        if (booking.status !== "booked") return res.status(400).json({ message: "Ticket not eligible" });

        // Calculate Time Rule
        const showTime = new Date(booking.show.startTime);
        const now = new Date();
        const diffHours = (showTime - now) / 36e5;

        if (diffHours < 0.5) return res.status(400).json({ message: "Resale closed (less than 30 mins to show)" });

        // Calculate Cut
        let cut = 0.10;
        if (diffHours <= 12) cut = 0.25;
        if (diffHours <= 1) cut = 0.45;

        const payout = booking.price * (1 - cut);

        booking.status = "resale_listed";
        booking.resaleDetails = {
            listingDate: now,
            expectedPayout: Math.floor(payout)
        };

        await booking.save();
        return res.status(200).json({ message: "Ticket listed for resale!", payout });

    } catch (err) {
        return res.status(500).json({ message: "Error listing ticket", error: err });
    }
};

// --- 2. GET MARKETPLACE (BUY) ---
export const getMarketplace = async (req, res) => {
    try {
        // Find bookings with status "resale_listed"
        // Also populate Movie details to show posters
        const tickets = await Bookings.find({ status: "resale_listed" })
            .populate("movie")
            .populate({ path: "show", populate: { path: "screen" } })
            .sort({ "resaleDetails.listingDate": -1 }); // Newest first

        return res.status(200).json({ tickets });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching market" });
    }
};

// --- 3. BUY RESALE TICKET ---
export const buyResaleTicket = async (req, res) => {
    const { bookingId, buyerId } = req.body;

    // 1. Initialize session
    const session = await mongoose.startSession();

    let oldBooking;
    let newBooking;
    let sellerPayout = 0;

    try {
        // --- Validation Checks BEFORE starting transaction ---
        // We will perform the critical check here without a transaction first.
        // This prevents the MongoTransactionError when returning early.
        oldBooking = await Bookings.findById(bookingId).populate('show');

        if (!oldBooking || oldBooking.status !== "resale_listed") {
            return res.status(400).json({ message: "Ticket no longer available" });
        }

        const showTime = new Date(oldBooking.show.startTime);
        if ((showTime - new Date()) / 36e5 < 0.5) {
            return res.status(400).json({ message: "Resale window closed during payment." });
        }

        // --- Start Transaction ---
        session.startTransaction();

        // Re-fetch within session (optional, but safer if another user attempted write simultaneously)
        oldBooking = await Bookings.findById(bookingId).populate('show').session(session);

        // --- PAYOUT CALCULATION ---
        sellerPayout = oldBooking.resaleDetails.expectedPayout;

        // 1. Mark Old Booking as RESOLD
        oldBooking.status = "resold";
        oldBooking.resaleDetails.buyer = buyerId;
        await oldBooking.save({ session });

        // 2. Create NEW Booking for Buyer
        newBooking = new Bookings({
            show: oldBooking.show,
            movie: oldBooking.movie,
            date: oldBooking.date,
            seatNumber: oldBooking.seatNumber,
            user: buyerId,
            price: oldBooking.price,
            status: "booked"
        });

        // 3. Link Booking to Buyer & Credit Seller
        const buyer = await User.findById(buyerId).session(session);
        const seller = await User.findById(oldBooking.user).session(session);

        buyer.bookings.push(newBooking);

        // Ensure seller exists before crediting
        if (seller) {
            seller.walletBalance = (seller.walletBalance || 0) + sellerPayout;
            await seller.save({ session });
        }

        await newBooking.save({ session });
        await buyer.save({ session });

        await session.commitTransaction();

        // --- 4. EMAIL LOGIC (Post-Commit) ---

        if (buyer && newBooking) {
            // A. Email Buyer (New Ticket) - Requires full population
            const populatedBooking = await newBooking.populate(['movie', { path: 'show', populate: { path: 'screen', populate: 'theatre' } }]);

            const pdfBuffer = await generateTicketPDF(populatedBooking, populatedBooking.movie, buyer);
            const buyerEmailDetails = {
                movieTitle: populatedBooking.movie.title,
                date: populatedBooking.date,
                seats: populatedBooking.seatNumber,
                bookingId: populatedBooking._id.toString().slice(-6).toUpperCase(),
                theatre: `${populatedBooking.show.screen.theatre.name}, ${populatedBooking.show.screen.name}`
            };
            await sendTicketEmail(buyer.email, buyerEmailDetails, pdfBuffer);
        }

        if (seller) {
            // B. Email Seller (Sold Notification + Payout)
            await sendResaleNotification(
                seller.email,
                seller.name.split(' ')[0],
                oldBooking.movie.title,
                sellerPayout
            );
        }
        // ---------------------------------

        return res.status(201).json({
            message: "Purchase Complete. Seller Credited.",
            booking: newBooking,
            payout: sellerPayout
        });

    } catch (err) {
        // FIX: The transaction needs to be aborted ONLY if it was started successfully.
        // However, since we moved the critical validation checks outside the try/catch, 
        // if an error occurs here, the transaction was running and needs to be aborted.
        await session.abortTransaction();
        return res.status(500).json({ message: "Purchase Failed", error: err.message });
    } finally {
        session.endSession();
    }
};