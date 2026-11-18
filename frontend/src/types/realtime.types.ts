
import type { Order, OrderStatus } from "./order.types";

export interface OrderStatusChangedEvent {
    orderId: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
}

export interface AdminRealtimeEvents {
    "order:new": (order: Order) => void;
    "order:status_changed": (event: OrderStatusChangedEvent) => void;
}
