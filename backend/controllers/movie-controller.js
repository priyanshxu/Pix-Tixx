import jwt from 'jsonwebtoken';
import Movie from '../models/Movie.js';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

// --- ADD MOVIE ---
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

    // 3. HANDLE FILE UPLOADS
    // req.files comes from Multer + Cloudinary
    const posterFiles = req.files['poster'];
    const bannerFiles = req.files['banner'];
    const castFiles = req.files['castImages'] || [];

    if (!posterFiles || posterFiles.length === 0) {
        return res.status(400).json({ message: "Poster image is required" });
    }

    // ✅ FIX: Use .path directly (It contains the full Cloudinary URL)
    const finalPosterUrl = posterFiles[0].path;

    const finalFeaturedUrl = bannerFiles && bannerFiles.length > 0
        ? bannerFiles[0].path // ✅ Use .path
        : "";

    // 4. EXTRACT & PARSE DATA
    const { title, description, releaseDate, featured } = req.body;

    // PARSE SEAT CONFIGURATION
    let seatConfiguration = [];
    try {
        seatConfiguration = JSON.parse(req.body.seatConfiguration);
    } catch (e) {
        seatConfiguration = req.body.seatConfiguration;
    }

    // PARSE CAST
    let castData = [];
    try {
        castData = JSON.parse(req.body.cast);
    } catch (e) {
        castData = [];
    }

    // MAP IMAGES TO CAST
    const finalCast = castData.map((actor, index) => {
        return {
            name: actor.name,
            // ✅ FIX: Use .path for cast images too
            imageUrl: castFiles[index] ? castFiles[index].path : ""
        };
    });


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
            cast: finalCast,
            posterUrl: finalPosterUrl,
            featuredUrl: finalFeaturedUrl,
            admin: adminId,
            seatConfiguration: seatConfiguration,
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

// --- UPDATE MOVIE ---
export const updateMovie = async (req, res, next) => {
    const id = req.params.id;
    const { title, description, releaseDate, featured, trailerUrl } = req.body;

    const posterFiles = req.files && req.files['poster'];
    const bannerFiles = req.files && req.files['banner'];

    let updateData = {
        title,
        description,
        releaseDate: new Date(`${releaseDate}`),
        featured,
        trailerUrl
    };

    // ✅ FIX: Use .path directly for updates as well
    if (posterFiles && posterFiles.length > 0) {
        updateData.posterUrl = posterFiles[0].path;
    }
    if (bannerFiles && bannerFiles.length > 0) {
        updateData.featuredUrl = bannerFiles[0].path;
    }

    // Parse JSON fields safely
    if (req.body.actors) {
        try { updateData.actors = JSON.parse(req.body.actors); }
        catch (e) { updateData.actors = req.body.actors; }
    }

    if (req.body.cast) {
        try { updateData.cast = JSON.parse(req.body.cast); }
        catch (e) { updateData.cast = req.body.cast; }
    }

    if (req.body.seatConfiguration) {
        try { updateData.seatConfiguration = JSON.parse(req.body.seatConfiguration); }
        catch (e) { updateData.seatConfiguration = req.body.seatConfiguration; }
    }

    let movie;
    try {
        movie = await Movie.findByIdAndUpdate(id, updateData, { new: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Update failed", error: err.message });
    }

    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json({ movie });
};

// --- ADD REVIEW ---
export const addReview = async (req, res, next) => {
    const id = req.params.id;
    const { userId, rating, comment } = req.body;

    try {
        const movie = await Movie.findById(id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });

        const user = await User.findById(userId);

        movie.reviews.push({
            user: userId,
            userName: user ? user.name : "Anonymous",
            rating,
            comment
        });

        await movie.save();
        return res.status(200).json({ message: "Review Added", movie });
    } catch (err) {
        return console.log(err);
    }
};

export const getAllMovies = async (req, res, next) => {
    let movies;
    try {
        movies = await Movie.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Request Failed" });
    }
    if (!movies) return res.status(500).json({ message: "Request Failed" });
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
    if (!movie) return res.status(404).json({ message: "Invalid Movie Id" });
    return res.status(200).json({ movie });
};

export const deleteMovie = async (req, res, next) => {
    const id = req.params.id;
    try {
        const movie = await Movie.findByIdAndDelete(id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        return res.status(200).json({ message: "Deleted Successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Delete failed" });
    }
};