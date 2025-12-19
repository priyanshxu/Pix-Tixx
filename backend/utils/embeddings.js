import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the specific model optimized for creating embeddings
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export const getEmbedding = async (text) => {
    try {
        // Ensure text is valid
        if (!text || typeof text !== 'string') {
            console.warn("Invalid text provided for embedding generation.");
            return [];
        }

        // Replace newlines to ensure better embedding quality
        const cleanText = text.replace(/\n/g, " ");

        const result = await model.embedContent(cleanText);
        const embedding = result.embedding;

        return embedding.values; // Returns an array of numbers (the vector)
    } catch (error) {
        console.error("❌ Error generating embedding:", error.message);
        // Return empty array so the app doesn't crash, but log the error
        return [];
    }
};