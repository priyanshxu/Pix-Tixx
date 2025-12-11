import mongoose from "mongoose";

const screenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, // e.g., "Audi 1", "IMAX Screen"
    theatre: {
        type: mongoose.Types.ObjectId,
        ref: "Theatre",
        required: true
    },
    // Move seatConfiguration here from Movie model
    seatConfiguration: {
        type: Array,
        required: true
    }
});

export default mongoose.model("Screen", screenSchema);