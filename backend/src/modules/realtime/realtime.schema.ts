
import { z } from "zod";

const orderStatusSchema = z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
]);

export const orderStatusChangedEventSchema = z.object({
    orderId: z.string(),
    previousStatus: orderStatusSchema,
    newStatus: orderStatusSchema,
});

export type OrderStatusChangedEvent = z.infer<
    typeof orderStatusChangedEventSchema
>;
