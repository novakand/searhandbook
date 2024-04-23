import { IHotelInfoOption } from './hotel-info-option.interface';

export interface IHotelInfo {
  hotelId?: number;
  gettingAround?: number;
  mainOptions?: IHotelInfoOption[];
  otherOptions?: IHotelInfoOption[];
  text?: string;
}
