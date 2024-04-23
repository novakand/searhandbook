export interface IPaymentResult {
  id: string;
  bookingId: string;
  description: string;
  isSuccess: boolean;
  cost: number;
  currency: string;
}
