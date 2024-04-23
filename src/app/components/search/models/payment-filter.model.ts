export class PaymentFilter {

  public travelerIdIn: number[];

  constructor(obj: Partial<PaymentFilter>) {
    Object.assign(this, obj);
  }

}
