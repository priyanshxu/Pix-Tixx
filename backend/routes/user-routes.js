import express from "express";
import {
    deleteUser,
    getAllUsers,
    getBookingsOfUser,
    getUserById, // Import this
    login,
    signup,
    updateUser,
    verifySignupOtp
} from "../controllers/user-controller.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/signup", signup);
userRouter.post("/verify", verifySignupOtp);
userRouter.post("/login", login);

userRouter.get("/bookings/:id", getBookingsOfUser);

// 👇 ADD THIS ROUTE (To get Profile Details)
userRouter.get("/:id", getUserById);

userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;