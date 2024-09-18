import express from 'express';
import { addMovie, getAllMovies, getMoviebyId } from '../controllers/movie-controller.js';

const movieRouter = express.Router();

movieRouter.get("/", getAllMovies);
movieRouter.get("/:id", getMoviebyId);
movieRouter.post("/", addMovie);

export default movieRouter;