import Razorpay from "razorpay";

import { env } from "../../config/env.js";

import type {
    CreateGatewayOrderInput,
    CreateGatewayOrderResult,
    FetchGatewayPaymentResult,
    PaymentGateway,
    VerifyPaymentSignatureInput,
} from "./payment.gateway.js";

import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

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

   verifyPaymentSignature(
    input: VerifyPaymentSignatureInput,
): boolean {
    return validatePaymentVerification(
        {
            order_id: input.gatewayOrderId,
            payment_id: input.gatewayPaymentId,
        },
        input.gatewaySignature,
        env.RAZORPAY_KEY_SECRET,
    );
}

async fetchPayment(
    gatewayPaymentId: string,
): Promise<FetchGatewayPaymentResult> {
    const payment =
        await this.razorpay.payments.fetch(gatewayPaymentId);

    return {
        gatewayPaymentId: payment.id,
        gatewayOrderId: payment.order_id,
        amountInPaise: Number(payment.amount),
        status: payment.status,
    };
}


}