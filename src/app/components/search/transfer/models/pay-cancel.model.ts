export class PayCancel {

  public connectionId: string;
  public bookingId: string;
  public partOfRoutes: string[];

  constructor(obj?: Partial<PayCancel>) {
    Object.assign(this, obj);
  }

}
