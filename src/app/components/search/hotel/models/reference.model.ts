import { ReferenceType } from '../enums';

export class Reference {

  public id: number;
  public referenceType: ReferenceType;
  public name: string;
  public value: string;

  constructor(obj?: Partial<Reference>) {
    Object.assign(this, obj);
  }

}
