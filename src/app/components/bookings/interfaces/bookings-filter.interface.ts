import { Application } from 'h21-be-ui-kit';

export interface IBookingsFilter {

  orderNumberStart?: string;
  tripId?: number;
  tripIdIn?: number[];
  viewOrderNumberStart?: string;
  stateCodeIn?: string[];
  paymentStateCodeIn?: string[];
  typeIdIn?: number[];
  bookerId?: number;
  customerNameStart?: string;
  createDateGreaterEqual?: string;
  createDateLessEqual?: string;
  arrivalDateGreaterEqual?: string;
  arrivalDateLessEqual?: string;
  departureDateGreaterEqual?: string;
  departureDateLessEqual?: string;
  tourOperatorCode?: string;
  tourOperatorNameStart?: string;
  pnrStart?: string;
  h21ProLogin?: number;
  providerCode?: string;
  bookingCode?: string;
  application?: Application;

}
