import type { Request, Response } from "express";

import { paymentService } from "./payment.service.js";
import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";

export const paymentController = {
    async initiatePayment(req: Request, res: Response) {
        const userId = req.user!.id;
        const orderId = req.params.orderId;

if (typeof orderId !== "string") {
    throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Invalid order ID",
        400,
    );
}

        const result = await paymentService.initiatePayment(
            userId,
            orderId,
        );

        res.status(201).json({
            success: true,
            data: result,
        });
    },
};