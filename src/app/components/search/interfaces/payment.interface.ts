export interface IPayment {
  id?: number;
  travelerId?: number;
  paymentTypeName?: string;
  paymentTypeId?: number;
  cardName: string;
  cardNumber: string;
  stateName: string;
  isDefault?: boolean;
  isHideCardDetail?: boolean;
  createDate?: Date;
  companyPaymentMethodId?: number;
}
