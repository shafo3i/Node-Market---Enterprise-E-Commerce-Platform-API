import express from "express";
import { handleStripeWebhook } from "../../lib/stripe/stripe.webhook";
import bodyParser from "body-parser";

const router = express.Router();

router.post("/stripe", bodyParser.raw({ type: "application/json" }), 
async (req, res) => {
    try {
        await handleStripeWebhook(req.body, req.headers["stripe-signature"] as string);
        res.status(200).send("Webhook received");
    } catch (error) {
        console.error("Error handling Stripe webhook:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;