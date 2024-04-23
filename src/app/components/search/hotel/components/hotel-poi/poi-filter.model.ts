export class PoiFilter {

  public comment: string;
  public tags: string;
  public nameOrTagsContains: string;
  public name: string;
  public description: string;
  public id: number;

  constructor(obj: Partial<PoiFilter>) {
    Object.assign(this, obj);
  }

}
