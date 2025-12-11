import mongoose from "mongoose";

const blockedSeatSchema = new mongoose.Schema({
    show: {
        type: mongoose.Types.ObjectId,
        ref: "Show",
        required: true
    },
    seatNumber: [{ type: String, required: true }],
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '10m' } // ⚡️ AUTO-DELETE after 10 minutes
    }
});

export default mongoose.model("BlockedSeat", blockedSeatSchema);