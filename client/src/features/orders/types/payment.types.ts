export interface CreatePaymentOrderResponse {
  createPaymentOrder: {
    razorpayOrderId: string;
    amount: number;
    currency: string;
  };
}

export interface CreatePaymentOrderVariables {
  orderId: string;
}