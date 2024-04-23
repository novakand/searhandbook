import { ILocation } from './location.model';
import { H21DateTime } from 'h21-be-ui-kit';

export class Route {

  public id: string;
  public fromLocation: ILocation;
  public toLocation: ILocation;
  public fromDate: H21DateTime;
  public toDate: string;
  public returnFromDate: string;
  public returnToDate: string;
  public shiftTime: number;
  public flightNumber: string;

  constructor(obj?: Partial<Route>) {
    Object.assign(this, obj);
  }

}
