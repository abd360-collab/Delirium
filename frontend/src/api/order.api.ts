import { apiClient } from "../lib/api/client";
import type { Order } from "../types/order.types";



interface CreateOrderResponse {
    success: boolean;
    data: {
        order: Order;
    };
}

interface GetOrderResponse {
    success: boolean;
    data: {
        order: Order;
    };
}

export async function createOrder(): Promise<Order> {
    const response =
        await apiClient.post<CreateOrderResponse>("/order/");

    return response.data.data.order;
}


export async function getOrder(
    orderId: string,
): Promise<Order> {
    const response =
        await apiClient.get<GetOrderResponse>(
            `/order/${orderId}`,
        );

    return response.data.data.order;
}