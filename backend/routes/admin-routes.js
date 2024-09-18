import express from 'express';
import { addAdmin, adminlogin, getAdmins } from '../controllers/admin-controller.js';

const adminRouter = express.Router();

adminRouter.post("/signup",addAdmin);
adminRouter.post("/login", adminlogin);
adminRouter.get("/", getAdmins)

export default adminRouter;