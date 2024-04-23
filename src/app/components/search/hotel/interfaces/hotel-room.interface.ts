export interface IHotelRoom {
  id?: number;
  hotelId?: number;
  providerCode?: string;
  breakfast?: number;
  nonRefundable?: boolean;
  rateDescription?: string;
  roomDescription?: string;
  price?: number;
  dayPrices?: number;
}

export interface ITripRoom {
  total: number;
  currency: string;
  paymentState: string;
  name: string;
  description: string;
  id: number;
}

export interface ITripFilter {
  name: string;
  paymentStateCodeIn: string[];
  application: string;
  id: number;
}
