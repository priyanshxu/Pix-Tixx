import express from "express";
import { deleteBooking, getBokingById,getBookedSeats, newBooking } from "../controllers/booking-controller.js";

const bookingRouter = express.Router();

bookingRouter.post("/", newBooking);
bookingRouter.get("/booked", getBookedSeats);
bookingRouter.get("/:id", getBokingById);
bookingRouter.delete("/:id",deleteBooking);
export default bookingRouter;