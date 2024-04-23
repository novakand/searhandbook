import { Segment } from './segment.model';
import { Vehicle } from './vehicle.model';

export class Transfer {

  public sessionId: string;
  public clientId: string;
  public requestId: string;
  public routeId: string;
  public segments: Segment[];
  public vehicles: Vehicle[];
  public isIndirect: true;
  public distance: 0;
  public duration: 0;
  public comfortable: any;
  public cost: 0;
  public currency: string;
  public flightNumber: string;
  public providerCode: string;
  public providerName: string;
  public id: string;

}
