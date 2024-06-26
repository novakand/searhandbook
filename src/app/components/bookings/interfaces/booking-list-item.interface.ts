import { IEntity } from 'h21-be-ui-kit';
import { BookingType, CancellationStateType } from '@components/bookings';

export interface IBookingListItem extends IEntity {
  tripId?: number;
  // selected?: boolean;
  cancellationState?: number;
  bookingCode?: string;
  typeName?: string;
  typeId?: number;
  company?: string;
  bookerId?: number;
  customerName?: string;
  corporateId?: number;
  createDate?: string;
  arrivalDate?: string;
  departureDate?: string;
  finalCost?: number;
  orderRate?: number;
  bookingType?: BookingType;
  currency?: string;
  cancellationMarkState?: CancellationStateType;
  bookingCost?: number;
  barCost?: number;
  paymentForm?: string;
  payAccountNumber?: string;
  tourOperatorCode?: string;
  tourOperatorName?: string;
  invoiceNumber?: string;
  orderStateId?: number;
  orderStateName?: string;
  orderStateDescription?: string;
  paymentStateName?: string;
  paymentStateDescription?: string;
  pnr?: string;
  h21ProLogin?: number;
  importDataId?: number;
  providerCode?: string;
  viewOrderNumber?: string;
  orderId?: number;
  id?: number;
  canCancel?: boolean;
  cancelPenaltyDeadTime?: string;
  nightsCount?: number;
  billDetailsReportId?: number;
  voucherReportId?: number;
  dateFormat?: string;
  typeCode?: string;
}
