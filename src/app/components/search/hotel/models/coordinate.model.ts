export class Coordinate {

  public latitude: number;
  public longitude: number;

  constructor(obj: Partial<Coordinate>) {
    Object.assign(this, obj);
  }

}
