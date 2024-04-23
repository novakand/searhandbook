import { ICompany, IEntity } from 'h21-be-ui-kit';

import { IDbiFields } from '.';
import { IPayment } from '@components/search';
import { PaymentType } from '@search/payment/payment.enum';

export interface ITraveler extends IEntity, IDbiFields {
  importDataId?: string;
  firstName?: string;
  lastName?: string;
  personalCode?: string;
  middleName?: string;
  function?: string;
  companyProfileIds?: number[];
  h21ProLogin?: number;
  airPlusProfile?: string;
  email?: string;
  isPayer?: boolean;
  nationality?: number;
  nationalityCode?: string;
  companyName?: string;
  photoFileHash?: string;
  payMethod?: IPayment;
  company?: string;
  companyProfile?: ICompany;
  jobTitle?: string;
  mobilePhone?: string;
  paymentTypes?: IPaymentType[];
  address?: {
    address?: string;
    addressTypeId?: number;
    addressTypeName?: string;
    city?: string;
    cityCode?: string;
    country?: string;
    countryCode?: string;
    id?: number;
    postalCode?: string;
    travelerId?: number;
  };
  travelerId?: number;
  countryCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface ITravelerList extends IEntity {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  companyProfileIds: number[];
  nationalityCode?: string;
  mobilePhone?: string;
  stateName?: string;
  photoFileHash?: string;
  createUserName?: string;
  countryCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface IPaymentType {
  paymentTypeCode: PaymentType;
  isDefault: boolean;
}

export interface IDocumentType {
  code: string;
  name: string;
  description: string;
  id: number;
}
