import express from 'express';
import {
    addAdmin, adminlogin, getAdmins, addCity,
    addTheatre,
    addScreen,
    addShow,
    getAllCities,
    getTheatresByCity,
    getShowsByMovieAndDate,
    getShowById} from '../controllers/admin-controller.js';

const adminRouter = express.Router();

adminRouter.post("/signup",addAdmin);
adminRouter.post("/login", adminlogin);
adminRouter.get("/", getAdmins)
adminRouter.post("/city", addCity);
adminRouter.post("/theatre", addTheatre);
adminRouter.post("/screen", addScreen);
adminRouter.post("/show", addShow);

// Helper Routes for UI
adminRouter.get("/city", getAllCities);
adminRouter.get("/city/:id/theatres", getTheatresByCity);
adminRouter.get("/shows", getShowsByMovieAndDate);
adminRouter.get("/show/:id", getShowById);

export default adminRouter;