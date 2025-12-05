import express from 'express';
import { addMovie, deleteMovie, getAllMovies, getMoviebyId, updateMovie, addReview } from '../controllers/movie-controller.js';
import multer from 'multer';

// Configure Multer Storage (Inline or import from your middleware)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

const movieRouter = express.Router();

movieRouter.get("/", getAllMovies);
movieRouter.get("/:id", getMoviebyId);
movieRouter.post("/review/:id", addReview);

// Update: Accept 2 files (poster & banner)
movieRouter.post("/", upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'castImages', maxCount: 10 } // Allow up to 10 cast images
]), addMovie);

// New Update Route
movieRouter.put("/:id", upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), updateMovie);

movieRouter.delete("/:id", deleteMovie);

export default movieRouter;