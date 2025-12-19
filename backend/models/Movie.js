import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // 🆕 NEW FIELDS
    genre: [{ type: String, required: true }], // e.g., ["Action", "Sci-Fi"]
    director: { type: String, required: true },
    runtime: { type: Number, required: true }, // In Minutes
    language: { type: String, required: true },
    censorRating: { type: String, required: true }, // e.g., "U/A", "A", "PG-13"

    trailerUrl: { type: String },
    releaseDate: {
        type: Date,
        required: true,
    },
    posterUrl: {
        type: String,
        required: true,
    },
    featuredUrl: { type: String },

    // Cast with Images
    cast: [{
        name: String,
        imageUrl: String
    }],

    // Legacy actors field (optional, can be derived from cast)
    actors: [{ type: String }],

    featured: {
        type: Boolean,
        required: true,
    },
    bookings: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
    admin: {
        type: mongoose.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
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
        date: { type: Date, default: Date.now },
        sentimentScore: { type: Number, default: 0 }
    }],
    // 🧠 For AI Search
    plot_embedding: {
        type: [Number],
        index: "vector"
    }
});

export default mongoose.model("Movie", movieSchema);