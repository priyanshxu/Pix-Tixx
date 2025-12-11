import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }, // Address
    city: {
        type: mongoose.Types.ObjectId,
        ref: "City",
        required: true
    },
    screens: [{
        type: mongoose.Types.ObjectId,
        ref: "Screen"
    }]
});

export default mongoose.model("Theatre", theatreSchema);