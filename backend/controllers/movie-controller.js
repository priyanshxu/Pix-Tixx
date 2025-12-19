import jwt from 'jsonwebtoken';
import Movie from '../models/Movie.js';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { getEmbedding } from "../utils/embeddings.js";
import Sentiment from 'sentiment';
const sentiment = new Sentiment();

// --- ADD MOVIE ---
export const addMovie = async (req, res, next) => {
    // 1. AUTHENTICATION
    const extractedToken = req.headers.authorization?.split(" ")[1];
    if (!extractedToken || extractedToken.trim() === "") {
        return res.status(404).json({ message: "Token Not Found" });
    }

    let adminId;
    try {
        const decrypted = jwt.verify(extractedToken, process.env.SECRET_KEY);
        adminId = decrypted.id;
    } catch (err) {
        return res.status(400).json({ message: "Invalid or Expired Token" });
    }

    // 2. FILE HANDLING
    const posterFiles = req.files['poster'];
    const bannerFiles = req.files['banner'];
    const castFiles = req.files['castImages'] || [];

    if (!posterFiles || posterFiles.length === 0) {
        return res.status(400).json({ message: "Poster image is required" });
    }

    const finalPosterUrl = posterFiles[0].path;
    const finalFeaturedUrl = bannerFiles && bannerFiles.length > 0 ? bannerFiles[0].path : "";

    // 3. EXTRACT NEW DATA FIELDS
    // Note: genre comes as a stringified array from FormData, same for cast
    const { title, description, releaseDate, featured, trailerUrl, director, runtime, language, censorRating } = req.body;

    // Parse Genre
    let finalGenre = [];
    try {
        finalGenre = JSON.parse(req.body.genre);
    } catch (e) {
        finalGenre = [req.body.genre]; // Fallback
    }

    // Parse Seat Config (Empty for now based on your logic)
    let seatConfiguration = [];
    try {
        seatConfiguration = JSON.parse(req.body.seatConfiguration);
    } catch (e) {
        seatConfiguration = [];
    }

    // Parse Cast
    let castData = [];
    try {
        castData = JSON.parse(req.body.cast);
    } catch (e) {
        castData = [];
    }

    // Map Cast Images
    const finalCast = castData.map((actor, index) => {
        return {
            name: actor.name,
            imageUrl: castFiles[index] ? castFiles[index].path : ""
        };
    });

    if (!title || !description || !director || !runtime) {
        return res.status(422).json({ message: "Invalid inputs: Missing required fields" });
    }

    let movie;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 🧠 4. GENERATE ENHANCED EMBEDDING
        // Include Director, Genre, Language in the AI Brain
        const textToEmbed = `
            Title: ${title}.
            Director: ${director}.
            Genre: ${finalGenre.join(", ")}.
            Language: ${language}.
            Runtime: ${runtime} minutes.
            Plot: ${description}
        `;
        const vector = await getEmbedding(textToEmbed);

        movie = new Movie({
            title,
            description,
            releaseDate: new Date(`${releaseDate}`),
            featured,
            trailerUrl,
            // 🆕 New Fields
            director,
            runtime,
            language,
            censorRating,
            genre: finalGenre,

            cast: finalCast,
            posterUrl: finalPosterUrl,
            featuredUrl: finalFeaturedUrl,
            admin: adminId,
            seatConfiguration: seatConfiguration,
            plot_embedding: vector, // Save AI Vector
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

    return res.status(201).json({ movie });
};

// --- UPDATE MOVIE ---
export const updateMovie = async (req, res, next) => {
    const id = req.params.id;
    const { title, description, releaseDate, featured, trailerUrl, genre } = req.body;

    const posterFiles = req.files && req.files['poster'];
    const bannerFiles = req.files && req.files['banner'];

    let updateData = {
        title,
        description,
        releaseDate: new Date(`${releaseDate}`),
        featured,
        trailerUrl,
        genre
    };

    if (posterFiles && posterFiles.length > 0) {
        updateData.posterUrl = posterFiles[0].path;
    }
    if (bannerFiles && bannerFiles.length > 0) {
        updateData.featuredUrl = bannerFiles[0].path;
    }

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

// --- ADD REVIEW (With Sentiment Analysis) ---
export const addReview = async (req, res, next) => {
    const id = req.params.id;
    const { userId, rating, comment } = req.body;

    try {
        const movie = await Movie.findById(id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });

        const user = await User.findById(userId);

        // 🧠 AI ANALYSIS: Calculate Sentiment Score
        // Returns a score: e.g., +3 (Good), -2 (Bad), 0 (Neutral)
        const result = sentiment.analyze(comment);
        const score = result.score;

        movie.reviews.push({
            user: userId,
            userName: user ? user.name : "Anonymous",
            rating,
            comment,
            sentimentScore: score // Save the vibe!
        });

        await movie.save();
        return res.status(200).json({ message: "Review Added", movie });
    } catch (err) {
        return console.log(err);
    }
};

// --- GET MOVIE (With Vibe Calculation) ---
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

    // 🧠 AI ANALYSIS: Generate "Audience Verdict" on the fly
    let vibeStats = {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: movie.reviews.length,
        verdict: "No reviews yet."
    };

    if (movie.reviews.length > 0) {
        movie.reviews.forEach(r => {
            // Check sentimentScore (default to 0 if undefined)
            const score = r.sentimentScore || 0;
            if (score > 1) vibeStats.positive++;
            else if (score < -1) vibeStats.negative++;
            else vibeStats.neutral++;
        });

        const positivePct = Math.round((vibeStats.positive / vibeStats.total) * 100);

        // Generate a human-readable verdict
        if (positivePct >= 80) vibeStats.verdict = "🔥 Absolute Blockbuster! The crowd loves it.";
        else if (positivePct >= 60) vibeStats.verdict = "😊 Mostly Positive. A solid watch.";
        else if (positivePct >= 40) vibeStats.verdict = "🤔 Mixed Reactions. Divisive among fans.";
        else vibeStats.verdict = "❄️ Cold Reception. Audiences are disappointed.";
    }

    // Return movie data AND the new Vibe Stats
    return res.status(200).json({ movie, vibe: vibeStats });
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