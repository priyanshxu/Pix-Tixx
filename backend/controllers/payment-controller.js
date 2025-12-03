import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: "rzp_test_RmpXXAam4cVGMK",
    key_secret: "bEhSNqNxgO0BoEkp4GaiSioK",
});

export const createPaymentOrder = async (req, res) => {
    const { amount } = req.body; // Amount in smallest currency unit (e.g., paise for INR)

    const options = {
        amount: amount * 100, // Razorpay takes amount in paise (1 INR = 100 paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};