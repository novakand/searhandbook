import { PaymentSystem } from '../payment.enum';
import { SearchMode } from '@search/enums';

export interface IPaymentInfo {
  type: SearchMode;
  timeout: number;
  totalAmount: ITotalAmount;
  hotel: IHotelPaymentInfo;
  transfer: ITransferPaymentInfo;
  paymentInit: IPaymentInit;
  paymentAccess: IPaymentAccess;
}

interface ITotalAmount {
  cost: number;
  currency: string;
}

interface IHotelPaymentInfo {
  hotelName: string;
  checkInDate: Date;
  checkOutDate: Date;
}

interface ITransferPaymentInfo {
  pickUpAddress: string;
  dropDownAddress: string;
  pickUpDateTime: Date;
}

interface IPaymentInit {
  payVision: IPaymentItem;
  airPlus: IPaymentItem;
  bta: IPaymentItem;
  id?: string;
}

export interface IPaymentItem {
  id: string;
  url: string;
}

export interface IPaymentList {
  stateId: number;
  isActive: boolean;
  isDefault: boolean;
  isHideCardDetail: boolean;
  isHideCardExpiryDate: boolean;
  paymentTypeId: number;
  paymentTypeCode: string;
  createDate: string;
  recipientBic: string;
  recipientBankName: string;
  recipientBankSwift: string;
  recipientAbaCode: string;
  recipientSortCode: string;
  recipientBankAddress: string;
  accountNumber: string;
  accountCurrencyCurrencyCode: string;
  correspondentBankName: string;
  correspondentBankSwift: string;
  correspondentBic: string;
  correspondentAbaCode: string;
  correspondentSortCode: string;
  correspondentAccount: string;
  correspondentAccountCurrencyCurrencyCode: string;
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  costModeId: number;
  referencesActual: IReferenceActual[];
  companyId: number;
  id: number;
}

export interface IReferenceActual {
  companyPaymentMethodId: number;
  cardReferenceId: number;
  name: string;
  value: string;
  substituteParameterId: number;
  substituteParameterName: string;
  isOptional: boolean;
  id: number;
  isDisabled: boolean;
  isRequired: boolean;
}

interface IPaymentAccess {
  profileId: number;
  hasPayVision: boolean;
  hasAirPlus: boolean;
  hasBta: boolean;
  paymentSystem: PaymentSystem;
  isDisabled: boolean;
  isRequired: boolean;
}
