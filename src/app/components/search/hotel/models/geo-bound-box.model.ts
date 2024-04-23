import { Coordinate } from './coordinate.model';

export class GeoBoundingBox {

  public topLeftPoint: Coordinate;
  public bottomRightPoint: Coordinate;

  constructor(obj?: Partial<GeoBoundingBox>) {
    Object.assign(this, obj);
  }

}
