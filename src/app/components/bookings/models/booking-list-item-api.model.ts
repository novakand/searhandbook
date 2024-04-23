import { IBookingListItemApi } from '@app/components/bookings/interfaces/booking-list-item-api.interface';

export class BookingListItemApi implements IBookingListItemApi {

  public id?: number;
  public orderId?: number;
  public orderStateName?: string;
  public orderStateDescription?: string;
  public typeId?: number;
  public tripId?: number;
  public typeName?: string;
  public customerId?: number;
  public customerName?: string;
  public arrivalDate?: string;
  public departureDate?: string;
  public tourOperatorCode?: string;
  public tourOperatorName?: string;
  public pnr?: string;
  public h21ProLogin?: number;
  public providerCode?: string;
  public bookingCode?: string;
  public cancelPenaltyDeadTime?: string;
  public gross?: number;
  public viewOrderNumber?: string;
  public createDate?: string;
  public createUserName?: string;
  public updateDate?: string;
  public updateUserName?: string;

  constructor(obj?: Partial<BookingListItemApi>) {
    Object.assign(this, obj);
  }

}
