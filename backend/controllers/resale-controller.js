import Bookings from "../models/Bookings.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getChannel, getQueueName } from "../config/rabbitmq.js"; // RabbitMQ Imports

// --- 1. LIST TICKET FOR SALE (Unchanged) ---
export const listForResale = async (req, res) => {
    const { bookingId, userId } = req.body;

    try {
        const booking = await Bookings.findById(bookingId).populate("show");
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.user.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });
        if (booking.status !== "booked") return res.status(400).json({ message: "Ticket not eligible" });

        const showTime = new Date(booking.show.startTime);
        const now = new Date();
        const diffHours = (showTime - now) / 36e5;

        if (diffHours < 0.5) return res.status(400).json({ message: "Resale closed (less than 30 mins to show)" });

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

// --- 2. GET MARKETPLACE (RabbitMQ Version) ---
export const getMarketplace = async (req, res) => {
    try {
        // Fetch all listed tickets
        const tickets = await Bookings.find({ status: "resale_listed" })
            .populate("movie")
            .populate("user")
            .populate({ path: "show", populate: { path: "screen" } })
            .sort({ "resaleDetails.listingDate": -1 });

        const activeTickets = [];
        const expiredTickets = [];
        const now = new Date();

        // Separate Active vs Expired
        for (const ticket of tickets) {
            const showTime = new Date(ticket.show.startTime);

            if (showTime < now) {
                expiredTickets.push(ticket);
            } else {
                activeTickets.push(ticket);
            }
        }

        // Process Expired Tickets
        if (expiredTickets.length > 0) {
            console.log(`[Resale] Found ${expiredTickets.length} expired tickets.`);

            const channel = getChannel();
            const queue = getQueueName();

            for (const ticket of expiredTickets) {
                // A. Update DB
                ticket.status = "unsold";
                await ticket.save();

                // B. Send to RabbitMQ Queue
                if (ticket.user && channel) {
                    const message = JSON.stringify({
                        event: 'RESALE_EXPIRED',
                        userEmail: ticket.user.email,
                        userName: ticket.user.name,
                        movieTitle: ticket.movie?.title || "Unknown Movie",
                        showDate: ticket.show.startTime
                    });

                    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
                }
            }
            console.log("✅ Sent expiry events to RabbitMQ");
        }

        return res.status(200).json({ tickets: activeTickets });

    } catch (err) {
        console.error("Marketplace Error:", err);
        return res.status(500).json({ message: "Error fetching market" });
    }
};

// --- 3. BUY RESALE TICKET (Fixed for RabbitMQ) ---
export const buyResaleTicket = async (req, res) => {
    const { bookingId, buyerId } = req.body;
    const session = await mongoose.startSession();
    let transactionCommitted = false;

    try {
        console.log('[resale] starting transaction...');

        // Pre-transaction validation
        let oldBooking = await Bookings.findById(bookingId).populate('movie').populate('show'); // Populated movie for notification details
        if (!oldBooking || oldBooking.status !== 'resale_listed') {
            return res.status(400).json({ message: 'Ticket no longer available' });
        }

        const showTime = new Date(oldBooking.show.startTime);
        if ((showTime - new Date()) / 36e5 < 0.5) {
            return res.status(400).json({ message: 'Resale window closed during payment.' });
        }

        // Start transaction
        await session.startTransaction();

        // Re-fetch inside session to lock
        oldBooking = await Bookings.findById(bookingId).session(session);
        // Note: Mongoose sessions might strip population, so we rely on variables captured before if needed, 
        // but for updates we must use the session object.

        if (!oldBooking || oldBooking.status !== 'resale_listed') {
            throw new Error('Ticket no longer available (post-fetch)');
        }

        const sellerPayout = oldBooking.resaleDetails?.expectedPayout ?? Math.floor(oldBooking.price * 0.9);

        // Mark old booking as resold
        oldBooking.status = 'resold';
        oldBooking.resaleDetails = {
            ...(oldBooking.resaleDetails || {}),
            buyer: buyerId,
            soldAt: new Date()
        };
        await oldBooking.save({ session });

        // Create new booking for buyer
        const newBooking = new Bookings({
            show: oldBooking.show,
            movie: oldBooking.movie,
            date: oldBooking.date,
            seatNumber: oldBooking.seatNumber,
            user: buyerId,
            price: oldBooking.price,
            status: 'booked',
            createdAt: new Date()
        });
        await newBooking.save({ session });

        // Link booking to buyer & credit seller
        const buyer = await User.findById(buyerId).session(session);
        const seller = await User.findById(oldBooking.user).session(session);

        if (!buyer) throw new Error('Buyer not found');

        buyer.bookings = Array.isArray(buyer.bookings) ? buyer.bookings : [];
        buyer.bookings.push(newBooking._id);
        await buyer.save({ session });

        if (seller) {
            seller.walletBalance = (seller.walletBalance || 0) + sellerPayout;
            await seller.save({ session });
        }

        // Commit transaction
        await session.commitTransaction();
        transactionCommitted = true;
        console.log('[resale] commit successful');

        // ---------- RABBITMQ EVENTS (Post-Commit) ----------
        try {
            const channel = getChannel();
            const queue = getQueueName();

            if (channel) {
                // 1. Event for the BUYER (Needs Ticket PDF)
                const buyerMessage = JSON.stringify({
                    event: 'RESALE_BUYER_CONFIRMATION',
                    bookingId: newBooking._id, // The NEW booking
                    userId: buyer._id,
                    userEmail: buyer.email
                });
                channel.sendToQueue(queue, Buffer.from(buyerMessage), { persistent: true });

                // 2. Event for the SELLER (Needs Payout Notification)
                if (seller) {
                    // We populated 'movie' in the first query before session, so we can access title
                    // If population was lost, we fallback to "Unknown Title"
                    const sellerBookingDetails = {
                        movieTitle: oldBooking.movie?.title || 'Unknown Title',
                        seats: oldBooking.seatNumber,
                        bookingId: oldBooking._id.toString().slice(-6).toUpperCase()
                    };

                    const sellerMessage = JSON.stringify({
                        event: 'RESALE_SELLER_NOTIFICATION',
                        sellerEmail: seller.email,
                        sellerName: seller.name,
                        payout: sellerPayout,
                        bookingDetails: sellerBookingDetails
                    });

                    channel.sendToQueue(queue, Buffer.from(sellerMessage), { persistent: true });
                }

                console.log('[RabbitMQ] Resale events published');
            } else {
                console.error("[RabbitMQ] Channel not active, could not send emails.");
            }

        } catch (queueErr) {
            console.error('[resale] Failed to publish RabbitMQ events:', queueErr);
            // Non-fatal: Transaction is committed, money is safe. 
        }
        // ------------------------------------------------

        return res.status(201).json({
            message: 'Purchase Complete. Seller Credited.',
            booking: newBooking,
            payout: sellerPayout
        });

    } catch (err) {
        console.error('[resale] error during purchase:', err);
        try {
            if (!transactionCommitted && session && session.inTransaction) {
                await session.abortTransaction();
            }
        } catch (abortErr) {
            console.error('[resale] abortTransaction failed:', abortErr);
        }
        return res.status(500).json({ message: 'Purchase Failed', error: err.message });
    } finally {
        session.endSession();
    }
};