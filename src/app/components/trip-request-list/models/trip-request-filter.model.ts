export class TripRequestFilter {

  public name: string;
  public departure: string;
  public arrival: string;
  public city: string;
  public pickUp: string;
  public dropDown: string;
  public from: string;
  public to: string;

  constructor(obj?: Partial<TripRequestFilter>) {
    Object.assign(this, obj);
  }

}
