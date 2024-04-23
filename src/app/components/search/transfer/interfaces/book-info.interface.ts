import { Application } from 'h21-be-ui-kit';

export interface IBookInfo {
  bookerId: number;
  connectionId: string;
  partOfRouteIds: string[];
  comment: string;
  bookerPhone: string;
  applicationType: Application;
}
