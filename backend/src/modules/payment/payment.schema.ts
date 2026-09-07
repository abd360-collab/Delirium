import { z } from "zod";

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
});

export const paymentSuccessEventSchema = z.object({
    paymentId: z.string().min(1),
    paymentAttemptId: z.string().min(1),
    orderId: z.string().min(1),
    amountInPaise: z.number().int().positive(),
});