import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    screen: {
        type: mongoose.Types.ObjectId,
        ref: "Screen",
        required: true
    },
    startTime: {
        type: Date,
        required: true
    }, // e.g., 2024-10-05T18:00:00
    price: {
        type: Number,
        required: true
    },
    bookings: [{
        type: mongoose.Types.ObjectId,
        ref: "Booking"
    }]
});

export default mongoose.model("Show", showSchema);