export class HitoryFilter {

  public clientId: number;
  public sessionId: string;

  constructor(obj: Partial<HitoryFilter>) {
    Object.assign(this, obj);
  }

}
