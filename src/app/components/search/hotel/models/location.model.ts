import { PointAddress } from 'h21-map';

export interface ILocation {
  address: string;
  iata: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string;
  pointAddress: PointAddress;
}

export class Location implements ILocation {

  public address: string;
  public iata: string;
  public latitude: number;
  public longitude: number;
  public googlePlaceId: string;
  public pointAddress: PointAddress;

  constructor(obj?: Partial<Location>) {
    Object.assign(this, obj);
  }

}
