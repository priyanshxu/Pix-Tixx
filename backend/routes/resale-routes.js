import express from "express";
import { listForResale, getMarketplace, buyResaleTicket } from "../controllers/resale-controller.js";

const resaleRouter = express.Router();

resaleRouter.post("/sell", listForResale);
resaleRouter.get("/market", getMarketplace);
resaleRouter.post("/buy", buyResaleTicket);

export default resaleRouter;