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


export interface VerifyPaymentSignatureInput {
    gatewayOrderId: string;
    gatewayPaymentId: string;
    gatewaySignature: string;
}

export interface PaymentGateway {
    createOrder(
        input: CreateGatewayOrderInput,
    ): Promise<CreateGatewayOrderResult>;

    verifyPaymentSignature(
        input: VerifyPaymentSignatureInput,
    ): boolean;
}

export interface FetchGatewayPaymentResult {
    gatewayPaymentId: string;
    gatewayOrderId: string;
    amountInPaise: number;
    status: string;
}

