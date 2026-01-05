



// import { prisma } from "../../config/prisma";
// import { stripe } from "./stripe.client";
// import { markPaymentPaid } from "../../modules/orders/orders.service";

// /**
//  * Handle Stripe Webhook
//  * @param rawBody - raw request body from Stripe
//  * @param signature - Stripe webhook signature
//  */
// export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err) {
//     console.error("⚠️ Webhook signature verification failed.", err);
//     throw err;
//   }

//   // Only handle payment_intent.succeeded
//   if (event.type !== "payment_intent.succeeded") return;

//   const intent = event.data.object as any;
//   const intentId = intent.id;

//   // 1️⃣ Prevent duplicate processing
//   const alreadyProcessed = await prisma.stripeEvent.findUnique({
//     where: { stripeEventId: event.id },
//   });

//   if (alreadyProcessed) return;

//   // 2️⃣ Store webhook event
//   await prisma.stripeEvent.create({
//     data: {
//       stripeEventId: event.id,
//       type: event.type,
//       paymentIntentId: intentId,
//       payload: intent,
//     },
//   });

//   // 3️⃣ Update Payment & Order in a transaction
//   await prisma.$transaction(async (tx) => {
//     // Update Payment status
//     const payment = await tx.payment.update({
//       where: {
//         provider_providerRef: {
//           provider: "STRIPE",
//           providerRef: intentId,
//         },
//       },
//       data: { status: "SUCCEEDED" },
//     });

//     // Update Order status
//     await tx.order.update({
//       where: { id: payment.orderId },
//       data: { status: "PROCESSING" },
//     });
//   });

//   console.log(`✅ Payment ${intentId} processed successfully.`);
// }


import { stripe } from "./stripe.client";
import { prisma } from "../../config/prisma";
import { OrdersService } from "../../modules/orders/orders.service";

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
    const event = stripe.webhooks.constructEvent(
        rawBody, 
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!);
        
    if (event.type === "payment_intent.succeeded") {

        // Prevent duplicate processing
        const alreadyProcessed = await prisma.stripeEvent.findUnique({
            where: {
                stripeEventId: event.id,
            },
        });

        if (alreadyProcessed) return;

        await prisma.stripeEvent.create({
            data: {
                stripeEventId: event.id,
                type: event.type,
                paymentIntentId: (event.data.object as any).id ?? null,
                payload: event.data.object as any,
            },
        });

        
        try {
            const intent = event.data.object as any;
            await OrdersService.markPaymentPaid(intent.id);
        } catch (err) {
            console.error(`❌ Failed to process payment :`, err );
            throw err;
        }

    }
}