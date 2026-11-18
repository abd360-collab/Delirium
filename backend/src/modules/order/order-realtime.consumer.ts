
import type { Server } from "socket.io";

import { logger } from "../../shared/observability/logger.js";
import { connectRabbitMQConsumer } from "../../infrastructure/messaging/rabbitmq/rabbitmq.js";
import { RABBITMQ_QUEUES } from "../../infrastructure/messaging/rabbitmq/rabbitmq.constants.js";
import { orderStatusChangedEventSchema } from "../realtime/realtime.schema.js";
import { REALTIME_ROOMS } from "../realtime/realtime.constants.js";
import { orderRepository } from "./order.repository.js";

const PREFETCH_COUNT = 10;

export async function startOrderRealtimeConsumer(
    io: Server,
): Promise<void> {
    const channel = await connectRabbitMQConsumer();

    channel.prefetch(PREFETCH_COUNT);

    await channel.consume(
        RABBITMQ_QUEUES.ORDER_STATUS_REALTIME,
        async (message) => {
            if (!message) {
                return;
            }

            try {
                const rawPayload = JSON.parse(         
                    message.content.toString("utf-8"),
                );

                const parsed =
                    orderStatusChangedEventSchema.safeParse(
                        rawPayload,
                    );

                if (!parsed.success) {
                    logger.error(
                        { error: parsed.error },
                        "Invalid order status changed event",
                    );

                    channel.nack(message, false, false);
                    return;
                }

                const event = parsed.data;

                // Notify the customer tracking this order.
                io.to(REALTIME_ROOMS.order(event.orderId)).emit(
                    "order:status_changed",
                    event,
                );

                if (event.newStatus === "CONFIRMED") {
                    // Load the persisted order with admin-facing details.
                    const order =
                        await orderRepository.findOrderForAdminById(
                            event.orderId,
                        );

                    if (order) {
                        // Send the complete order to connected admins.
                        io.to(REALTIME_ROOMS.ADMINS).emit(
                            "order:new",
                            order,
                        );
                    } else {
                        logger.warn(
                            { orderId: event.orderId },
                            "Confirmed order not found for admin notification",
                        );
                    }
                }

                // Admins also receive subsequent status changes.
                io.to(REALTIME_ROOMS.ADMINS).emit(
                    "order:status_changed",
                    event,
                );

                channel.ack(message);

                logger.info(
                    {
                        orderId: event.orderId,
                        previousStatus: event.previousStatus,
                        newStatus: event.newStatus,
                    },
                    "Order realtime event delivered",
                );
            } catch (error) {
                logger.error(
                    {
                        error,
                        messageId: message.properties.messageId,
                    },
                    "Failed to process order realtime message",
                );

                channel.nack(message, false, false);
            }
        },
    );

    logger.info(
        { prefetchCount: PREFETCH_COUNT },
        "Order realtime consumer started",
    );
}
