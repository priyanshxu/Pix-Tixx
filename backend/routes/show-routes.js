import express from "express";
import { getShowById } from "../controllers/admin-controller.js"; // Import the function

const showRouter = express.Router();

// Public route to fetch show details by ID
// URL will be: http://localhost:5000/show/:id
showRouter.get("/:id", getShowById);

export default showRouter;