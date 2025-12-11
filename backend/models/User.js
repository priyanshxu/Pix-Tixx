import mongoose from "mongoose";
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name : {
        type: String,
        required: true,
    },
    email: {
        type : String,
        required: true,
        unique : true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    bookings: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    walletBalance: {
        type: Number,
        default: 0,
    }
})

export default mongoose.model("User", userSchema);

// users 