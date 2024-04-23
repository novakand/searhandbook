export interface IOrderNotification {
  error: string;
  message: string;
  queryId: string;
  responseId: string;
  orderItemId: number;
  tripId: number;
  isSuccess: boolean;
}
