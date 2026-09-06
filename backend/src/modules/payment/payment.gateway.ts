export interface CreateGatewayOrderInput {
    amountInPaise: number;
    receipt: string;
}

export interface CreateGatewayOrderResult {
    gatewayOrderId: string;
    amountInPaise: number;
    currency: string;
}

export interface PaymentGateway {
    createOrder(
        input: CreateGatewayOrderInput,
    ): Promise<CreateGatewayOrderResult>;
}