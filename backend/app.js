import express, { Router } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user-routes.js";
import adminRouter from "./routes/admin-routes.js";
import movieRouter from "./routes/movie-routes.js";
import bookingRouter from "./routes/booking-routes.js";
import paymentRouter from './routes/payment-routes.js';
import showRouter from "./routes/show-routes.js";
import resaleRouter from "./routes/resale-routes.js";
dotenv.config();
const app = express();
//middlewares
app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/admin/config", adminRouter);
app.use("/movie", movieRouter);
app.use('/uploads', express.static('uploads'));
app.use("/booking", bookingRouter);
app.use("/show", showRouter);
app.use("/payment", paymentRouter);
app.use("/resale", resaleRouter);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(
        `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.7i3wdxl.mongodb.net/appName=Cluster0`
        // `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.7i3wdxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    )
    .then(() =>
        app.listen(process.env.PORT,() => 
            console.log(1`Connected to Database and Server is running ${PORT}`)
        )
    )
    .catch((e) => console.log(e));
