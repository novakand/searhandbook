export class AdditionalReference {

  public id: number;
  public companyProfileId: number;
  public typePatternID = 1;
  public name: string;
  public value: string;
  public entityState: number;
  public createDate: string;
  public createUserName: string;
  public updateDate: string;
  public updateUserName: string;

  constructor(obj?: Partial<AdditionalReference>) {
    Object.assign(this, obj);
  }

}
