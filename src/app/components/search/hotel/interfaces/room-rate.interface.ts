import { IFileInfo } from 'h21-be-ui-kit';

export interface IRoomRate {
  id: string;
  roomType: string;
  description: string;
  boardingName: string;
  totalCost: number;
  averagePerNightCost: number;
  currency: string;
  isRefundable: boolean;
  penaltyDate: string;
  nightQuantity: number;
  supplier: IFileInfo;
  providerName: string;
  isAllowedToBook?: boolean;
}

export interface IRoomBatchId {
  batchId: string;
}

export interface IRoomListBatch {
  batchId: string;
  list: IRoomRate[];
}
