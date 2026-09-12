export interface CreateGatewayOrderInput {
  amountInPaise: number;
  receipt: string;
}

export interface CreateGatewayOrderResult {
  gatewayOrderId: string;
  amountInPaise: number;
  currency: string;
}

export interface VerifyPaymentSignatureInput {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface VerifyWebhookSignatureInput {
  rawBody: Buffer;
  webhookSignature: string;
}

export interface FetchGatewayPaymentResult {
  gatewayPaymentId: string;
  gatewayOrderId: string;
  amountInPaise: number;
  status: string;
}

export interface PaymentGateway {
  createOrder(
    input: CreateGatewayOrderInput,
  ): Promise<CreateGatewayOrderResult>;

  verifyPaymentSignature(
    input: VerifyPaymentSignatureInput,
  ): boolean;

  verifyWebhookSignature(
    input: VerifyWebhookSignatureInput,
  ): boolean;

  fetchPayment(
    gatewayPaymentId: string,
  ): Promise<FetchGatewayPaymentResult>;
}