import { Coordinate } from './coordinate.model';

export class GeoDistance {

  public centerPoint: Coordinate;
  public radius: number;
  public distanceUnit: any;

  constructor(obj?: Partial<GeoDistance>) {
    Object.assign(this, obj);
  }

}
