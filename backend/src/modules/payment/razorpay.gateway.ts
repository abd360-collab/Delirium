import Razorpay from "razorpay";

import { env } from "../../config/env.js";

import type {
    CreateGatewayOrderInput,
    CreateGatewayOrderResult,
    PaymentGateway,
} from "./payment.gateway.js";

export class RazorpayGateway implements PaymentGateway {
    private readonly razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(
        input: CreateGatewayOrderInput,
    ): Promise<CreateGatewayOrderResult> {
        const order = await this.razorpay.orders.create({
            amount: input.amountInPaise,
            currency: "INR",
            receipt: input.receipt,
        });

        return {
            gatewayOrderId: order.id,
            amountInPaise: Number(order.amount),
            currency: order.currency,
        };
    }
}