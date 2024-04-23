import { ISignalrNotify } from './i-signalr-notify';
import { NotifyStatusType } from '@models/notify/notify-status-type';

export interface IImportNotify extends ISignalrNotify {
  message?: string;
  status?: NotifyStatusType;
}
