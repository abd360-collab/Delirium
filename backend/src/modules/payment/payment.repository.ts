import { prisma } from "../../lib/prisma.js";
import type { PaymentAttemptStatus, PaymentStatus, PrismaClient } from "../../generated/prisma/client.js";
import type { CreatePaymentAttemptData, CreatePaymentData } from "./payment.types.js";

type PaymentDb = Pick<
    PrismaClient,
    "payment" | "paymentAttempt"
>;

export const paymentRepository = {

    findPaymentByOrderId(
        orderId: string,
        db: PaymentDb = prisma,
    ) {
        return db.payment.findUnique({
            where: {
                orderId,
            },
        });
    },
   
    createPaymentAttempt(
    data: CreatePaymentAttemptData,
    db: PaymentDb = prisma,
) {
    return db.paymentAttempt.create({
        data: {
            paymentId: data.paymentId,
            amountInPaise: data.amountInPaise,
        },
    });
},

updatePaymentAttemptGatewayOrderId(
    attemptId: string,
    gatewayOrderId: string,
    db: PaymentDb = prisma,
) {
    return db.paymentAttempt.updateMany({
        where: {
            id: attemptId,
            gatewayOrderId: null,
        },
        data: {
            gatewayOrderId,
        },
    });
},

findActiveAttemptByPaymentId(
    paymentId: string,
    db: PaymentDb = prisma,
) {
    return db.paymentAttempt.findFirst({
        where: {
            paymentId,
            status: "CREATED",
            gatewayOrderId: {
                not: null,
            },
        },
    });
},

    createPayment(
    data: CreatePaymentData,
    db: PaymentDb = prisma,
) {
    return db.payment.create({
        data: {
            orderId: data.orderId,
            amountInPaise: data.amountInPaise,
            gateway: data.gateway,
        },
    });
},





updatePaymentStatus(
    paymentId: string,
    currentStatus: PaymentStatus,
    newStatus: PaymentStatus,
    db: PaymentDb = prisma,
) {
    return db.payment.updateMany({
        where: {
            id: paymentId,
            status: currentStatus,
        },
        data: {
            status: newStatus,
        },
    });
},


updatePaymentAttemptStatus(
    attemptId: string,
    currentStatus: PaymentAttemptStatus,
    newStatus: PaymentAttemptStatus,
    db: PaymentDb = prisma,
) {
    return db.paymentAttempt.updateMany({
        where: {
            id: attemptId,
            status: currentStatus,
        },
        data: {
            status: newStatus,
        },
    });
},

findAttemptByGatewayOrderId(
    gatewayOrderId: string,
    db: PaymentDb = prisma,
) {
    return db.paymentAttempt.findUnique({
        where: {
            gatewayOrderId,
        },
        include: {
            payment: true,
        },
    });
},

updatePaymentAttemptGatewayDetails(
    attemptId: string,
    gatewayPaymentId: string,
    gatewaySignature: string,
    db: PaymentDb = prisma,
) {
    return db.paymentAttempt.updateMany({
        where: {
            id: attemptId,
            gatewayPaymentId: null,
            gatewaySignature: null,
        },
        data: {
            gatewayPaymentId,
            gatewaySignature,
        },
    });
},

};