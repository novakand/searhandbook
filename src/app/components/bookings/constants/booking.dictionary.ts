import { BookingType } from '../enums/booking-type';

export class BookingDictionary {

  [key: number]: BookingType;

  constructor() {
    this[1] = BookingType.Hotel;
    this[2] = BookingType.Transfer;
    this[3] = BookingType.Train;
    this[4] = BookingType.Air;
  }

}
