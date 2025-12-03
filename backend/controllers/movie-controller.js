import jwt from 'jsonwebtoken';
import Movie from '../models/Movie.js';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

export const addMovie = async (req, res, next) => {
    // 1. EXTRACT TOKEN
    const extractedToken = req.headers.authorization?.split(" ")[1];
    if (!extractedToken || extractedToken.trim() === "") {
        return res.status(404).json({ message: "Token Not Found" });
    }

    let adminId;

    // 2. VERIFY TOKEN
    try {
        const decrypted = jwt.verify(extractedToken, process.env.SECRET_KEY);
        adminId = decrypted.id;
    } catch (err) {
        return res.status(400).json({ message: "Invalid or Expired Token" });
    }

    // 3. HANDLE FILE UPLOAD
    // Note: Since you are checking for req.file, make sure your Frontend uses 'FormData'
    if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
    }

    // Construct the URL
    const finalPosterUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // 4. EXTRACT & PARSE DATA
    const { title, description, releaseDate, featured } = req.body;

    // PARSE ACTORS (Handle stringified JSON from FormData)
    let actors = [];
    try {
        actors = JSON.parse(req.body.actors);
    } catch (e) {
        actors = req.body.actors;
    }

    // --- NEW: PARSE SEAT CONFIGURATION ---
    // The Admin Panel sends this as a JSON string within FormData
    let seatConfiguration = [];
    try {
        seatConfiguration = JSON.parse(req.body.seatConfiguration);
    } catch (e) {
        // Fallback if it was sent as raw JSON object
        seatConfiguration = req.body.seatConfiguration;
    }

    // Validation
    if (!title || title.trim() === "" || !description || description.trim() === "" || !seatConfiguration) {
        return res.status(422).json({ message: "Invalid inputs" });
    }

    let movie;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        movie = new Movie({
            title,
            description,
            releaseDate: new Date(`${releaseDate}`),
            featured,
            actors,
            posterUrl: finalPosterUrl,
            admin: adminId,
            seatConfiguration: seatConfiguration, // <--- ADDED THIS
        });

        await movie.save({ session });

        const adminUser = await Admin.findById(adminId);
        adminUser.addedMovies.push(movie);
        await adminUser.save({ session });

        await session.commitTransaction();

    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        return res.status(500).json({ message: "Request Failed", error: err.message });
    } finally {
        session.endSession();
    }

    if (!movie) {
        return res.status(500).json({ message: "Request Failed" });
    }

    return res.status(201).json({ movie });
};

export const getAllMovies = async (req, res, next) => {
    let movies;

    try {
        movies = await Movie.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Request Failed" });
    }

    if (!movies) {
        return res.status(500).json({ message: "Request Failed" });
    }
    return res.status(200).json({ movies });
};

export const getMoviebyId = async (req, res, next) => {
    const id = req.params.id;
    let movie;
    try {
        movie = await Movie.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Fetching movie failed" });
    }
    if (!movie) {
        return res.status(404).json({ message: "Invalid Movie Id" });
    }
    return res.status(200).json({ movie });
};

export const deleteMovie = async (req, res, next) => {
    const id = req.params.id;
    let movie;
    try {
        movie = await Movie.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Delete failed" });
    }
    if (!movie) {
        return res.status(500).json({ message: "Something went wrong" });
    }
    res.status(200).json({ message: "Deleted Successfully" });
};