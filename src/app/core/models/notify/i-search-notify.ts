import { IQueryResult } from 'h21-be-ui-kit';
import { IResponseNotify } from '@models/notify/response-notify.interface';

export interface ISearchNotify<T> extends IResponseNotify<IQueryResult<T>> {
  queryId?: string;
  result: IQueryResult<T>;
}
