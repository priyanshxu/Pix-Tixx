import express from 'express';
import { addMovie, deleteMovie, getAllMovies, getMoviebyId } from '../controllers/movie-controller.js';

const movieRouter = express.Router();

movieRouter.get("/", getAllMovies);
movieRouter.get("/:id", getMoviebyId);
movieRouter.post("/", addMovie);
movieRouter.delete("/:id", deleteMovie);

export default movieRouter;