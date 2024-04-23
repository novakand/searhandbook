export interface IReference {
  value: string;
  isInvoice: true;
  isVoucher: true;
  orderItemId: number;
  name: string;
  description: string;
  id: number;
}

export interface IOrderResult {
  isSuccess?: boolean;
  message: string;
  recordId: string;
  sender: string;
  providerName: string;
  paymentMethod?: string;
  id: string;
  connectionId: string;
  providerLogoUrl: string;
}
