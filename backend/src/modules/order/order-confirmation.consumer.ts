import { logger } from "../../lib/logger.js";
import { connectRabbitMQConsumer } from "../../lib/rabbitmq.js";
import {
    RABBITMQ_QUEUES,
} from "../../lib/rabbitmq.constants.js";
import { paymentSuccessEventSchema } from "../payment/payment.schema.js";
import { orderService } from "./order.service.js";

const PREFETCH_COUNT = 10;

export async function startOrderConfirmationConsumer(): Promise<void> {
    const channel = await connectRabbitMQConsumer();

    channel.prefetch(PREFETCH_COUNT);

    await channel.consume(
        RABBITMQ_QUEUES.ORDER_CONFIRMATION,
        async (message) => {
            if (!message) {
                return;
            }

            try {
                const rawPayload = JSON.parse(
                    message.content.toString("utf-8"),
                );

                const parsed =
                    paymentSuccessEventSchema.safeParse(
                        rawPayload,
                    );

                if (!parsed.success) {
                    logger.error(
                        {
                            error: parsed.error,
                        },
                        "Invalid payment success event",
                    );

                    channel.nack(
                        message,
                        false,
                        false,
                    );

                    return;
                }

                const event = parsed.data;

                logger.info(
                    {
                        event,
                    },
                    "Payment success event received",
                );

                await orderService.confirmOrderAfterPayment(
                    event.orderId,
                );

                channel.ack(message);

                logger.info(
                    {
                        orderId: event.orderId,
                        paymentId: event.paymentId,
                    },
                    "Order confirmed after successful payment",
                );
            } catch (error) {
                logger.error(
                    {
                        err: error,
                        messageId: message.properties.messageId,
                    },
                    "Failed to process payment success event",
                );

                channel.nack(
                    message,
                    false,
                    true,
                );
            }
        },
    );

    logger.info(
        {
            prefetchCount: PREFETCH_COUNT,
        },
        "Order confirmation consumer started",
    );
}