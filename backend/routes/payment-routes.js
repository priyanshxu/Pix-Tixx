import express from 'express';
import { createPaymentOrder } from '../controllers/payment-controller.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', createPaymentOrder);

export default paymentRouter;