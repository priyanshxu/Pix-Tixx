import mongoose from "mongoose";
import Bookings from "../models/Bookings.js";
import BlockedSeat from "../models/BlockedSeat.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { getChannel, getQueueName } from "../config/rabbitmq.js";

// --- 1. HOLD SEATS (unchanged) ---
export const holdSeats = async (req, res, next) => {
    const { show, seatNumber, user } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingBooking = await Bookings.findOne({
            show: show,
            seatNumber: { $in: seatNumber }
        }).session(session);

        if (existingBooking) {
            await session.abortTransaction();
            return res.status(409).json({ message: "One or more seats already booked" });
        }

        const blocked = await BlockedSeat.findOne({
            show: show,
            seatNumber: { $in: seatNumber }
        }).session(session);

        if (blocked) {
            await session.abortTransaction();
            return res.status(409).json({ message: "Seats are currently on hold by another user. Try again in 10 mins." });
        }

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

export const newBooking = async (req, res, next) => {
    const { show, seatNumber, user, blockId, price, walletUsed, totalPaid } = req.body;

    let existingShow;
    let existingUser;
    let booking;

    try {
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
        if (blockId) {
            const hold = await BlockedSeat.findById(blockId).session(session);
            if (!hold) {
                await session.abortTransaction();
                return res.status(408).json({ message: "Session expired or invalid. Seats released." });
            }
            await BlockedSeat.findByIdAndDelete(blockId).session(session);
        } else {
            const isTaken = await Bookings.findOne({ show, seatNumber: { $in: seatNumber } }).session(session);
            if (isTaken) {
                await session.abortTransaction();
                return res.status(409).json({ message: "Seats already booked." });
            }
        }

        if (walletUsed && walletUsed > 0) {
            if (existingUser.walletBalance < walletUsed) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Insufficient wallet balance during final processing." });
            }
            existingUser.walletBalance -= walletUsed;
        }
        booking = new Bookings({
            show: existingShow._id,
            movie: existingShow.movie._id,
            date: existingShow.startTime,
            user,
            seatNumber,
            price: price, 
            totalPaid: totalPaid
        });

        existingUser.bookings.push(booking);
        existingShow.bookings.push(booking);

        await existingUser.save({ session });
        await existingShow.save({ session });
        await booking.save({ session });

        await session.commitTransaction();

        try {
            const channel = getChannel();
            const queue = getQueueName();

            if (channel && user) {
                // Prepare the payload
                const message = JSON.stringify({
                    event: 'BOOKING_CONFIRMED',
                    bookingId: booking._id,
                    userId: existingUser._id,
                    userEmail: existingUser.email,
                    movieTitle: existingShow.movie.title,
                    seatNumber: booking.seatNumber,
                    date: existingShow.startTime,
                    theatre: `${existingShow.screen.theatre.name}, ${existingShow.screen.name}`
                });

                // Send to Queue
                channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
                console.log("✅ Booking confirmation sent to RabbitMQ");
            }
        } catch (err) {
            // Log error but DO NOT fail the booking response
            console.error("❌ Failed to queue booking email:", err);
        }

    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        return res.status(500).json({ message: "Booking Failed", error: err });
    } finally {
        session.endSession();
    }

    if (!booking) return res.status(500).json({ message: "Failed to finalize booking" });
    return res.status(201).json({ booking });
};
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
        const bookings = await Bookings.find({ show: showId });
        const confirmedSeats = bookings.reduce((acc, booking) => acc.concat(booking.seatNumber), []);

        const blocked = await BlockedSeat.find({ show: showId });
        const blockedSeats = blocked.reduce((acc, block) => acc.concat(block.seatNumber), []);

        return res.status(200).json({ bookedSeats: [...confirmedSeats, ...blockedSeats] });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching seats" });
    }
};