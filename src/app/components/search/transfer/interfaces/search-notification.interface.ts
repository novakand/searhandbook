export interface ISearchNotification {
  message?: string;
  requestId?: string;
  batchId?: string;
  sender?: string;
  count?: number;
  isCompleted?: boolean;
  loadedList?: boolean;
}
