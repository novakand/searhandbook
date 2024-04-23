export class Passenger {

  public id: number;
  public firstName: string;
  public lastName: string;
  public isPrimary: boolean;
  public phone: string;

  constructor(obj?: Partial<Passenger>) {
    Object.assign(this, obj);
  }

}
