import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";
import { RABBITMQ_ROUTING_KEYS } from "../../lib/rabbitmq.constants.js";

export function getOutboxRoutingKey(eventType: string): string {
    switch (eventType) {
        case "PAYMENT_SUCCESS":
            return RABBITMQ_ROUTING_KEYS.PAYMENT_SUCCESS;

        default:
            throw new AppError(
                ERROR_CODES.VALIDATION_ERROR,
                `Unsupported outbox event type: ${eventType}`,
                400,
            );
    }
}