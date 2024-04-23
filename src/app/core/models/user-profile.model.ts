import { IFileInfo } from 'h21-be-ui-kit';

export class UserProfile {

  public id: number;
  public code: string;
  public createUserName: string;
  public createDate: Date;
  public updateDate: Date;
  public countryCode: string;
  public cityCode: string;
  public firstName: string;
  public lastName: string;
  public middleName: string;
  public phone: string;
  public email: string;
  public stateId: number;
  public avatar: IFileInfo;
  public avatarFileHash: string;
  public entityRefId: number;
  public identityUserId: string;
  public isEmailConfirmed: boolean;

  constructor(obj?: Partial<UserProfile>) {
    Object.assign(this, obj);
  }

}

export class UserLinkTableItem {

  public id: number;
  public subjectId: number;
  public subjectType: number;
  public subjectTypeName: string;
  public subjectName: string;

  constructor(id: number,
              subjectId: number,
              subjectType: number,
              subjectTypeName: string,
              subjectName: string) {
    this.id = id;
    this.subjectId = subjectId;
    this.subjectType = subjectType;
    this.subjectTypeName = subjectTypeName;
    this.subjectName = subjectName;
  }

}
