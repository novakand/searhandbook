import { BookingListItemApi } from '@app/components/bookings/models/booking-list-item-api.model';
import { Application } from 'h21-be-ui-kit';

export interface IBookingTrip {

  id?: number;
  orderList?: BookingListItemApi[];
  applicationType?: Application;

}
