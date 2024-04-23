import { IBookingItem } from '@components/bookings/interfaces/booking-item.interface';
import { ITravelerListItem } from '@components/bookings/interfaces/traveler-list-item.interface';
import { IBookingOrderItemDetailsApi } from '@components/bookings/interfaces/booking-order-item-details.api.interface';
import { ICompanyProfile, IReference } from '../interfaces';
import { BookingOrderItemDetails } from '@components/bookings/models/booking-order-item-details.model';
import { BookingType } from '@components/bookings';

export class BookingItem implements IBookingItem {

  public arrivalDate: string;
  public bookingCode: string;
  public cancelPenaltyDeadTime: string;
  public cancelBeforeDate?: string;
  public bookerId: number;
  public corporateId: number;
  public corporateName: number;
  public createDate: string;
  public createUserName: string;
  public customer: ICompanyProfile;
  public departureDate: string;
  public h21ProLogin: number;
  public id: number;
  public invoiceNumber: string;
  public orderId: number;
  public paymentStateDescription: string;
  public paymentStateName: string;
  public pnr: any;
  public providerCode: string;
  public orderStateDescription: string;
  public orderStateName: string;
  public tourOperatorCode: string;
  public tourOperatorName: string;
  public travelers: ITravelerListItem[];
  public orderItemDetails: IBookingOrderItemDetailsApi[];
  public details: BookingOrderItemDetails;
  public tripId: number;
  public typeId: number;
  public orderStateId: number;
  public typeName: string;
  public updateDate: string;
  public updateUserName: string;
  public viewOrderNumber: string;
  public baseCost: number;
  public horseCost = 0;
  public invoiceCost = 0;
  public finalCost = 0;
  public orderCancellationState: string;
  public currency: string;
  public providerConfirmation: string;

  public bookingType: BookingType;
  public tripName: string;
  public orderPlacedDate: string;
  public customerName: string;
  public bookerName: string;
  public companyName: string;
  public refundSum: number;
  public refundSumDate: string;
  public payTypeName: string;
  public accountNumber: string;
  public travelerLinks: ITravelerListItem[];
  public bookingCost: number;
  public barCost: number;
  public providerName: string;
  public billDetailsReportId: number;
  public voucherReportId: number;
  public orderItemReferencesActual: IReference[];
  public referencesActual: IReference[];
  public paymentMethodReferences?: IReference[];
  public canCancel: boolean;

  constructor(obj?: Partial<IBookingItem>) {
    Object.assign(this, obj);

    this.details = new BookingOrderItemDetails(this.orderItemDetails);
  }

}
