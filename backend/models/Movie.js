import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    trailerUrl: { type: String },
    actors : [{type: String, required: true}],
    releaseDate:{
        type: Date,
        required: true,
    },
    posterUrl:{
        type: String,
        required: true,
    },
    cast: [{
        name: String,
        imageUrl: String
    }],
    featured:{
        type: Boolean,
        required: true,
    },
    bookings:[ { type: mongoose.Types.ObjectId, ref: "Booking"}],
    admin:{
        type: mongoose.Types.ObjectId,
        ref : "Admin",
        required: true,
    },
    featuredUrl: { type: String }, 
    seatConfiguration: {
        type: [ 
            {
                rowLabel: String,
                seats: [Number],
                price: Number
            }
        ],
        required: true
    },
    reviews: [{
        user: { type: mongoose.Types.ObjectId, ref: "User" },
        userName: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
    }]
});

export default mongoose.model("Movie",movieSchema);
