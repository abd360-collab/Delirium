export interface CreateOrderItemData {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPriceInPaise: number;
}


export interface CreateOrderData {
    userId: string;
    subtotalInPaise: number;
    totalInPaise: number;
    items: CreateOrderItemData[];
}