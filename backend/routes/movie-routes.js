import express from 'express';
import { addMovie, deleteMovie, getAllMovies, getMoviebyId } from '../controllers/movie-controller.js';
import { upload } from '../middlewares/upload.js';

const movieRouter = express.Router();

movieRouter.get("/", getAllMovies);
movieRouter.get("/:id", getMoviebyId);
movieRouter.delete("/:id", deleteMovie);
movieRouter.post("/add", upload.single("image"), addMovie);

export default movieRouter;