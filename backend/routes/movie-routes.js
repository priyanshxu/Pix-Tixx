import express from 'express';
import { addMovie, deleteMovie, getAllMovies, getMoviebyId, updateMovie, addReview } from '../controllers/movie-controller.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// --- CLOUDINARY CONFIGURATION START ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pix-tix-movies', // Keeping movie uploads in their own folder
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

const upload = multer({ storage });
// --- CLOUDINARY CONFIGURATION END ---

const movieRouter = express.Router();

movieRouter.get("/", getAllMovies);
movieRouter.get("/:id", getMoviebyId);
movieRouter.post("/review/:id", addReview);

// Update: Accept 2 files (poster & banner) + Cast images
// Multer will now upload these straight to Cloudinary and put the URL in req.files
movieRouter.post("/", upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'castImages', maxCount: 10 }
]), addMovie);

// New Update Route
movieRouter.put("/:id", upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), updateMovie);

movieRouter.delete("/:id", deleteMovie);

export default movieRouter;