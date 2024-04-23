import { PaymentMethod } from '@search/payment/payment.enum';
import { ITraveler, ITrip } from '@components/search';
import { IReference } from '@hotel/components/hotel-order/reference.interface';

export interface IBookOrder {
  connectionId: string;
  trip: ITrip;
  extras: any;
  comment: string;
  travelers: ITraveler[];
  references: IReference[];
  paymentMethod: PaymentMethod;
  unitId: string;
}
