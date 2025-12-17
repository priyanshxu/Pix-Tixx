import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    show: { // 👇 LINK TO SHOW
        type: mongoose.Types.ObjectId,
        ref: "Show",
        required: true,
    },
    movie: {
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    bookingDate: { // When the booking was made
        type: Date,
        default: Date.now
    },
    seatNumber: [{
        type: String,
        required: true
    }], 
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    price: { type: Number, required: true }, // Store original price paid
    status: {
        type: String,
        enum: ["booked", "resale_listed", "resold", "cancelled", "unsold"],
        default: "booked"
    },
    resaleDetails: {
        listingDate: Date,
        expectedPayout: Number, // How much seller gets
        buyer: { type: mongoose.Types.ObjectId, ref: "User" } // Who bought it (if resold)
    }
});

export default mongoose.model("Booking", bookingSchema);