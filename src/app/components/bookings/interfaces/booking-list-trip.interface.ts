import { IEntity } from 'h21-be-ui-kit';
import { IBookingListItem } from './booking-list-item.interface';

export interface IBookingListTrip extends IEntity {
  id?: number;
  name?: string;
  tripId?: number;
  air?: boolean;
  transfer?: boolean;
  hotel?: boolean;
  train?: boolean;
  bookings?: IBookingListItem[];
  orderItems?: IBookingListItem[];
}
