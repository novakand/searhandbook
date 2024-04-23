import { Application } from 'h21-be-ui-kit';

export class TravelerFilter {

  public expressionNameContains: string;
  public nameContains: string;
  public emailContains: string;
  public nationalityCode: string;
  public stateIdIn: string[];
  public companyProfileId: number;
  public application: Application;
  public companyProfileIdIn: number[];

  constructor(obj?: Partial<TravelerFilter>) {
    Object.assign(this, obj);
  }

}
