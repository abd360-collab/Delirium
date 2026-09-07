export const RABBITMQ_EXCHANGES = {
    PAYMENT_EVENTS: "payment.events",
} as const;

export const RABBITMQ_QUEUES = {
    ORDER_CONFIRMATION: "order.confirmation",
} as const;

export const RABBITMQ_ROUTING_KEYS = {
    PAYMENT_SUCCESS: "payment.success",
} as const;