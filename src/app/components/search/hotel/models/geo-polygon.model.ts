import { Coordinate } from './coordinate.model';

export class GeoPolygon {

  public points: Coordinate[];

  constructor(obj?: Partial<GeoPolygon>) {
    Object.assign(this, obj);
  }

}
