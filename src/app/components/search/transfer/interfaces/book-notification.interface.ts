export interface IBookNotification {
  queryId: string;
  responseId: string;
  isSuccess?: boolean;
  message?: string;
  recordId?: string;
  sender?: string;
  requestId?: string;
  roomId?: string;
  cancelDescription?: string;
  isRefundable?: boolean;
  penaltyDate?: string;
}
