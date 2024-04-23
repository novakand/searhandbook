import { ISignalrNotify } from '@models/notify/i-signalr-notify';

export interface IResponseNotify<T> extends ISignalrNotify {
  queryId?: string;
  result: T;
}
