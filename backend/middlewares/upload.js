import multer from 'multer';
import path from 'path';

// 1. Define Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // This folder must exist in your project root!
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Rename file to avoid duplicates (e.g., stree-2-171555.jpg)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// 2. Initialize Upload Variable
export const upload = multer({ storage: storage });