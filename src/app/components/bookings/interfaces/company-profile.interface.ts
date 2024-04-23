import {
  ICodeNamedEntity,
  IFileInfo,
  IH21DateTime,
  INamedEntity
} from 'h21-be-ui-kit';

export interface ICompanyProfile extends ICodeNamedEntity {
  parent?: INamedEntity;
  shortName?: string;
  typeId?: number;
  typeName?: string;
  regionId?: number;
  phone?: string;
  fax?: string;
  email?: string;
  homePage?: string;
  vatNumber?: string;
  registerNumber?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  licenseNumber?: string;
  entityState?: number;
  createDate?: IH21DateTime;
  createUserName?: string;
  updateDate?: IH21DateTime;
  updateUserName?: string;
  avatar?: IFileInfo;
  stateId?: number;
  countryCode?: string;
  entityId?: number;
  profileId?: number;
}
