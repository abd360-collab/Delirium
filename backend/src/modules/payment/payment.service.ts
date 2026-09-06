import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";
import { orderRepository } from "../order/order.repository.js"
import { paymentRepository } from "./payment.repository.js";
import { RazorpayGateway } from "./razorpay.gateway.js";

const paymentGateway = new RazorpayGateway();
export const paymentService = {

    async initiatePayment(
    userId: string,
    orderId: string,
    ) {
         
        const order = await orderRepository.findOrderById(orderId);

        if(!order) {
             throw new AppError(
                ERROR_CODES.ORDER_NOT_FOUND,
                "Order not found",
                404,
            );
        }

        if(order.userId !== userId) {
            throw new AppError(
                ERROR_CODES.FORBIDDEN,
                "You do not have permission to pay for this order",
                403,
            );
        }

        if(order.status !== "PENDING") {
            throw new AppError(
                ERROR_CODES.CONFLICT,
                `Order cannot be paid because its status is ${order.status}`,
                409,
            );
        }


        let payment = await paymentRepository.findPaymentByOrderId(
            order.id,
        );
       
        if(payment?.status === "SUCCESS") {
            throw new AppError(
                ERROR_CODES.CONFLICT,
                "Order has already been paid",
                409,
            );
        }

        if(!payment) {
             payment = await paymentRepository.createPayment({
                orderId: order.id,
                amountInPaise: order.totalInPaise,
                gateway: "RAZORPAY",
            });
        }

        let attempt = await paymentRepository.findActiveAttemptByPaymentId(
    payment.id,
);

if (!attempt) {
    attempt = await paymentRepository.createPaymentAttempt({
        paymentId: payment.id,
        amountInPaise: payment.amountInPaise,
    });

    const gatewayOrder = await paymentGateway.createOrder({
        amountInPaise: attempt.amountInPaise,
        receipt: `delirium_attempt_${attempt.id}`,
    });

    const result =
        await paymentRepository.updatePaymentAttemptGatewayOrderId(
            attempt.id,
            gatewayOrder.gatewayOrderId,
        );

    if (result.count !== 1) {
        throw new AppError(
            ERROR_CODES.CONFLICT,
            "Payment attempt was already associated with a gateway order",
            409,
        );
    }

    return {
        paymentId: payment.id,
        attemptId: attempt.id,
        orderId: order.id,
        amountInPaise: payment.amountInPaise,
        gatewayOrderId: gatewayOrder.gatewayOrderId,
        currency: gatewayOrder.currency,
    };
}

        
       return {
    paymentId: payment.id,
    attemptId: attempt.id,
    orderId: order.id,
    amountInPaise: payment.amountInPaise,
    gatewayOrderId: attempt.gatewayOrderId,
    currency: "INR",
};

    }
}