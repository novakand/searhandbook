import { Point } from 'h21-map';

export class TripTransfer {

  public pickUp: TransferPoint;
  public dropDown: TransferPoint;
  public actionDateTime: Date;
  public luggageAmount: number;
  public petsAmount: number;
  public includesWheelChair: boolean;

  constructor(obj?: Partial<TripTransfer>) {
    Object.assign(this, obj);
  }

}

export class TransferPoint {

  public address: string;

  constructor(point: Point) {
    this.address = point.name;
  }

}
