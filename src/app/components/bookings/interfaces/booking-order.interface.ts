export interface IBookingOrder {
  total?: number;
  orderPlacedDate?: string;
  totalOther?: number;
  currency?: string;
  tax?: number;
  isIncludeTax?: boolean;
  stateName?: string;
  paymentStateName?: string;
  payDate?: string;
  invoiceNumber?: string;
  importDataId?: number;
  refundSum?: number;
  createDate?: string;
  createUserName?: string;
  updateDate?: string;
  updateUserName?: string;
  id: number;

}
