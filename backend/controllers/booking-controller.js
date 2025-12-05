import mongoose from "mongoose";
import Bookings from "../models/Bookings.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
// Import the utilities we created earlier
import { generateTicketPDF } from "../utils/generateTicket.js";
import { sendTicketEmail } from "../utils/sendMail.js";

// --- 1. NEW BOOKING (Updated with Email & PDF Logic) ---
export const newBooking = async (req, res, next) => {
    const { movie, date, seatNumber, user } = req.body;

    let existingMovie;
    let existingUser;
    try {
        existingMovie = await Movie.findById(movie);
        existingUser = await User.findById(user);
    } catch (err) {
        return res.status(500).json({ message: "Database Error", error: err });
    }

    if (!existingMovie) {
        return res.status(404).json({ message: "Movie not found" });
    }
    if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
    }

    let booking;
    try {
        booking = new Bookings({
            movie,
            date: new Date(`${date}`),
            user,
            seatNumber, // Array of seats
        });

        const session = await mongoose.startSession();
        session.startTransaction();

        existingUser.bookings.push(booking);
        existingMovie.bookings.push(booking);

        await existingUser.save({ session });
        await existingMovie.save({ session });
        await booking.save({ session });

        await session.commitTransaction();

        // --- START EMAIL LOGIC ---
        console.log("Booking saved. Generating Ticket..."); // LOG 1

        try {
            // 1. Generate PDF Buffer
            const pdfBuffer = await generateTicketPDF(booking, existingMovie, existingUser);
            console.log("PDF Generated."); // LOG 2

            // 2. Prepare Email Details
            const emailDetails = {
                movieTitle: existingMovie.title,
                date: booking.date,
                seats: booking.seatNumber,
                bookingId: booking._id.toString().slice(-6).toUpperCase()
            };

            // 3. Send Email
            await sendTicketEmail(existingUser.email, emailDetails, pdfBuffer);
            console.log(`Email sent successfully to ${existingUser.email}`); // LOG 3

        } catch (emailErr) {
            console.error("FAILED to send ticket email:", emailErr);
            // We do NOT stop the request here because the booking is already real/saved.
        }
        // --- END EMAIL LOGIC ---

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Booking Failed", error: err });
    }

    if (!booking) {
        return res.status(500).json({ message: "Unable to create a Booking" });
    }

    return res.status(201).json({ booking });
};

// --- 2. GET BOOKING BY ID (Fixed Missing Poster) ---
export const getBokingById = async (req, res, next) => {
    const id = req.params.id;
    let booking;
    try {
        // 👇 CRITICAL FIX: .populate("movie") loads the Title & PosterUrl
        booking = await Bookings.findById(id).populate("movie");
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
        booking = await Bookings.findByIdAndDelete(id).populate("user movie");
        const session = await mongoose.startSession();
        session.startTransaction();
        await booking.user.bookings.pull(booking);
        await booking.movie.bookings.pull(booking);
        await booking.movie.save({ session });
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
    const { movieId, date } = req.query;
    try {
        const bookings = await Bookings.find({ movie: movieId, date: new Date(date) });
        const bookedSeats = bookings.reduce((acc, booking) => acc.concat(booking.seatNumber), []);
        return res.status(200).json({ bookedSeats });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching seats" });
    }
};