export class HotelConfirm {

  public connectionId: string;
  public batchId: string;

  constructor(obj?: Partial<HotelConfirm>) {
    Object.assign(this, obj);
  }

}
