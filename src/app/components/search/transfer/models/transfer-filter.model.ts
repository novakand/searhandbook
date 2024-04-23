import { Route } from './route.model';

export class TransferFilter {

  public clientId: string;
  public sessionId: string;
  public trip: string;
  public routes: Route[];
  public travelersQuantity: number;
  public luggageQuantity: number;
  public petQuantity: number;
  public isWheelChair: boolean;
  public waitTime: number;
  public connectionId: string;
  public children: number[];
  public staticUrl: string;

  public primaryTraveler: any;

  constructor(obj?: Partial<TransferFilter>) {
    Object.assign(this, obj);
  }

}
