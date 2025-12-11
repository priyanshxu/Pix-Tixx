import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    }, // e.g., "MUM", "DEL"
    theatres: [{
        type: mongoose.Types.ObjectId,
        ref: "Theatre"
    }]
});

export default mongoose.model("City", citySchema);