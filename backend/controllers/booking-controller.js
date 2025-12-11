import mongoose from "mongoose";
import Bookings from "../models/Bookings.js";
import BlockedSeat from "../models/BlockedSeat.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { generateTicketPDF } from "../utils/generateTicket.js";
import { sendTicketEmail } from "../utils/sendMail.js";

// --- 1. HOLD SEATS (Call this BEFORE opening Razorpay) ---
export const holdSeats = async (req, res, next) => {
    const { show, seatNumber, user } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // A. Check verified bookings
        const existingBooking = await Bookings.findOne({
            show: show,
            seatNumber: { $in: seatNumber }
        }).session(session);

        if (existingBooking) {
            await session.abortTransaction();
            return res.status(409).json({ message: "One or more seats already booked" });
        }

        // B. Check blocked seats (other users currently paying)
        const blocked = await BlockedSeat.findOne({
            show: show,
            seatNumber: { $in: seatNumber }
        }).session(session);

        if (blocked) {
            await session.abortTransaction();
            return res.status(409).json({ message: "Seats are currently on hold by another user. Try again in 10 mins." });
        }

        // C. Block them!
        const newBlock = new BlockedSeat({ show, seatNumber, user });
        await newBlock.save({ session });

        await session.commitTransaction();
        return res.status(201).json({ message: "Seats held", blockId: newBlock._id });

    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Error holding seats", error: err });
    } finally {
        session.endSession();
    }
};

// --- 2. NEW BOOKING (Updated to finalize after payment) ---
export const newBooking = async (req, res, next) => {
    // We now book a "show", not just a movie/date
    const { show, seatNumber, user, blockId, price } = req.body; // Receive blockId and price

    let existingShow;
    let existingUser;
    let booking; // Declare booking here so it's accessible outside the try block

    try {
        // Fetch Show and populate Movie & Screen details
        existingShow = await Show.findById(show)
            .populate("movie")
            .populate({
                path: "screen",
                populate: { path: "theatre" }
            });

        existingUser = await User.findById(user);
    } catch (err) {
        return res.status(500).json({ message: "Database Error", error: err });
    }

    if (!existingShow) return res.status(404).json({ message: "Show not found" });
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Verify and Consume the Block (If blockId provided)
        if (blockId) {
            const hold = await BlockedSeat.findById(blockId).session(session);
            if (!hold) {
                await session.abortTransaction();
                return res.status(408).json({ message: "Session expired or invalid. Seats released." });
            }
            // Delete the block because we are making it permanent
            await BlockedSeat.findByIdAndDelete(blockId).session(session);
        } else {
            // Optional: If no blockId (direct booking without hold logic), perform a standard check
            const isTaken = await Bookings.findOne({ show, seatNumber: { $in: seatNumber } }).session(session);
            if (isTaken) {
                await session.abortTransaction();
                return res.status(409).json({ message: "Seats already booked." });
            }
        }

        // 2. Create Permanent Booking
        booking = new Bookings({ // Assign to outer scoped 'booking' variable
            show: existingShow._id,
            movie: existingShow.movie._id,
            date: existingShow.startTime,
            user,
            seatNumber,
            price: price,
        });

        existingUser.bookings.push(booking);
        existingShow.bookings.push(booking);

        await existingUser.save({ session });
        await existingShow.save({ session });
        await booking.save({ session });

        await session.commitTransaction();

        // --- EMAIL LOGIC ---
        console.log("Booking saved. Generating Ticket...");

        try {
            // Check if movie/user are fully populated before calling generateTicketPDF
            const pdfBuffer = await generateTicketPDF(booking, existingShow.movie, existingUser);
            const emailDetails = {
                movieTitle: existingShow.movie.title,
                date: existingShow.startTime,
                seats: booking.seatNumber,
                bookingId: booking._id.toString().slice(-6).toUpperCase(),
                theatre: `${existingShow.screen.theatre.name}, ${existingShow.screen.name}`
            };

            await sendTicketEmail(existingUser.email, emailDetails, pdfBuffer);
            console.log(`Email sent to ${existingUser.email}`);

        } catch (emailErr) {
            console.error("FAILED to send ticket email:", emailErr);
        }

    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        return res.status(500).json({ message: "Booking Failed", error: err });
    } finally {
        session.endSession();
    }

    // FIX: Return the booking object here
    if (!booking) return res.status(500).json({ message: "Failed to finalize booking" });
    return res.status(201).json({ booking });
};

// ... (Rest of your controller: getBokingById, getBookedSeats, deleteBooking) ...
export const getBokingById = async (req, res, next) => {
    const id = req.params.id;
    let booking;
    try {
        booking = await Bookings.findById(id)
            .populate("movie")
            .populate({
                path: "show",
                populate: { path: "screen", populate: { path: "theatre" } }
            });
    } catch (err) {
        console.log(err);
    }
    if (!booking) {
        return res.status(500).json({ message: "Unexpected error" });
    }
    return res.status(200).json({ booking });
};

export const deleteBooking = async (req, res, next) => {
    const id = req.params.id;
    let booking;
    try {
        booking = await Bookings.findByIdAndDelete(id).populate("user show");
        const session = await mongoose.startSession();
        session.startTransaction();
        await booking.user.bookings.pull(booking);
        if (booking.show) {
            await booking.show.bookings.pull(booking);
            await booking.show.save({ session });
        }
        await booking.user.save({ session });
        session.commitTransaction();
    } catch (err) {
        return console.log(err);
    }
    if (!booking) {
        return res.status(500).json({ message: "Unexpected error" });
    }
    return res.status(200).json({ message: "Deleted Successfully" });
};

export const getBookedSeats = async (req, res, next) => {
    const { showId } = req.query;
    try {
        // 1. Get Confirmed Bookings
        const bookings = await Bookings.find({ show: showId });
        const confirmedSeats = bookings.reduce((acc, booking) => acc.concat(booking.seatNumber), []);

        // 2. Get Blocked Seats (Currently being paid for)
        const blocked = await BlockedSeat.find({ show: showId });
        const blockedSeats = blocked.reduce((acc, block) => acc.concat(block.seatNumber), []);

        // Combine them so the UI disables both
        return res.status(200).json({ bookedSeats: [...confirmedSeats, ...blockedSeats] });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching seats" });
    }
};