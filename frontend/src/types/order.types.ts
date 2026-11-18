
export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

export interface OrderItem {
    id: string;
    orderId: string;
    menuItemId: string;
    name: string;
    quantity: number;
    unitPriceInPaise: number;
    createdAt: string;
}

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    subtotalInPaise: number;
    totalInPaise: number;
    phoneNumber: string;
    deliveryAddress: string;

    // Exact destination captured when the order was placed.
    // Null supports older orders created before coordinates were stored.
    deliveryLatitude: number | null;
    deliveryLongitude: number | null;

    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}
