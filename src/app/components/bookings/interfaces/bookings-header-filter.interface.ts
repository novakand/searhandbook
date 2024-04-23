export interface IBookingsHeaderFilter {

  totalGreaterEqual?: string;
  totalLessEqual?: string;
  orderPlacedDateGreaterEqual?: string;
  orderPlacedDateLessEqual?: string;
  stateCodeIn?: string;
  paymentStateCodeIn?: string;
  id?: number;

}
