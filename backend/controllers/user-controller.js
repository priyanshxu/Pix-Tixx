import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Booking from "../models/Bookings.js";
import bcrypt from "bcryptjs";
import { sendOtpEmail, sendWelcomeEmail } from "../utils/sendMail.js";

export const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        return console.log(err);
    }
    if (!users) {
        return res.status(500).json({ message: "Unexpected Error occured" });
    }
    return res.status(200).json({ users });
};

// --- NEW FUNCTION: Get Single User Details ---
export const getUserById = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        return console.log(err);
    }
    if (!user) {
        return res.status(500).json({ message: "User not found" });
    }
    // Return user info (excluding password ideally, but for now sending object)
    return res.status(200).json({ user });
};

export const signup = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name && name.trim() === "" && !email && email.trim() === "" && !password && password.trim() === "") {
        return res.status(422).json({ message: "Invalid Inputs" });
    }

    // Check if user exists
    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return console.log(err);
    }

    if (existingUser) {
        return res.status(400).json({ message: "User already exists! Login instead." });
    }

    const hashedPassword = bcrypt.hashSync(password);

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let user;
    try {
        user = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false
        });
        user = await user.save();

        await sendOtpEmail(user.email, otp);
    } catch (err) {
        return console.log(err);
    }

    if (!user) {
        return res.status(500).json({ message: "Unexpected Error occured" });
    }

    return res.status(201).json({ message: "OTP_SENT", userId: user._id });
};

export const verifySignupOtp = async (req, res, next) => {
    const { userId, otp } = req.body;

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        return console.log(err);
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    sendWelcomeEmail(user.email, user.name).catch(err => console.log("Welcome email failed", err));

    return res.status(200).json({ message: "Signup Successful", id: user._id });
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email && email.trim() === "" && !password && password.trim() === "") {
        return res.status(422).json({ message: "Invalid Inputs" });
    }
    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return console.log(err);
    }
    if (!existingUser) {
        return res.status(404).json({ message: "Unable to find User from ID" });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Password" });
    }

    return res.status(200).json({ message: "Login Succesful", id: existingUser._id });
};

export const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { name, email, password } = req.body;
    if (!name && name.trim() === "" && !email && email.trim() === "" && !password && password.trim() === "") {
        return res.status(422).json({ message: "Invalid Inputs" });
    }
    const hashedPassword = bcrypt.hashSync(password);
    let user;
    try {
        user = await User.findByIdAndUpdate(id, { name, email, password: hashedPassword });
    } catch (err) {
        return console.log(err);
    }
    if (!user) {
        return res.status(500).json({ message: "Something went wrong" });
    }
    res.status(200).json({ message: " Updated Succesfully" });
};

export const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findByIdAndDelete(id);
    } catch (err) {
        return console.log(err);
    }
    if (!user) {
        return res.status(500).json({ message: "Something went wrong" });
    }
    res.status(200).json({ message: " Deleted Succesfully" });
}

export const getBookingsOfUser = async (req, res, next) => {
    const id = req.params.id;
    let bookings;
    try {
        bookings = await Booking.find({ user: id }).populate("movie").populate("show");
    } catch (err) {
        return console.log(err);
    }
    if (!bookings) {
        return res.status(500).json({ message: "Unable to get bookings" });
    }
    res.status(200).json({ bookings });
};
// ... imports

export const getUserRecommendations = async (req, res) => {
    const userId = req.params.id;

    try {
        const userBookings = await Booking.find({ user: userId }).populate("movie");

        // --- 1. COLD START (No History) ---
        if (!userBookings || userBookings.length === 0) {
            // Try to find featured movies
            let defaultRecs = await Movie.find({ featured: true }).limit(4);

            // 🛡️ FALLBACK: If no featured movies, just pick the latest 4 movies
            if (defaultRecs.length === 0) {
                defaultRecs = await Movie.find().sort({ releaseDate: -1 }).limit(4);
            }

            return res.status(200).json({ recommendations: defaultRecs, reason: "Top Picks for You" });
        }

        // --- 2. HAS HISTORY ---
        const allGenres = userBookings
            .filter(b => b.movie) // Filter out deleted movies
            .map(b => b.movie.genre)
            .flat();

        if (allGenres.length === 0) {
            const defaultRecs = await Movie.find().sort({ releaseDate: -1 }).limit(4);
            return res.status(200).json({ recommendations: defaultRecs, reason: "Trending Now" });
        }

        const genreCounts = {};
        allGenres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });

        const topGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]).slice(0, 2);

        const bookedMovieIds = userBookings.filter(b => b.movie).map(b => b.movie._id);

        // Find movies with matching genres
        let recommendations = await Movie.find({
            genre: { $in: topGenres },
            _id: { $nin: bookedMovieIds }
        }).limit(4);

        // 🛡️ FALLBACK: If we couldn't find matching genre movies, show generic ones
        if (recommendations.length === 0) {
            recommendations = await Movie.find({ _id: { $nin: bookedMovieIds } }).limit(4);
        }

        return res.status(200).json({
            recommendations,
            reason: `Because you watch ${topGenres.join(" & ")}`
        });

    } catch (err) {
        console.error("Recs Error:", err);
        return res.status(500).json({ message: "Error fetching recommendations" });
    }
};