import { upload } from '../middlewares/upload.js'; // Import from step 2
import Movie from '../models/Movie'; // Your Model

// usage: router.post('/add', upload.single('image'), addMovie);

export const addMovie = async (req, res, next) => {
    // req.file contains the image info
    // req.body contains the text data (title, description, etc.)

    if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
    }

    // Construct the URL String
    // This creates: "http://localhost:5000/uploads/1721216.jpg"
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    try {
        const movie = new Movie({
            title: req.body.title,
            description: req.body.description,
            posterUrl: imageUrl, // <--- SAVING THE STRING TO MONGODB
            releaseDate: req.body.releaseDate,
            featured: req.body.featured,
        });

        await movie.save();
        return res.status(201).json({ movie });
    } catch (err) {
        return console.log(err);
    }
};