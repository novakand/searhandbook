import { IBookingListItem, IBookingListTrip } from '@app/components/bookings/interfaces';
import { BookingType } from '@app/components/bookings/enums/booking-type';
import { BookingDictionary } from '@app/components/bookings/constants/booking.dictionary';

export class BookingDataSource {

  private static _bookingDictionary = new BookingDictionary();

  public orderList: IBookingListItem[] = [];
  public tripList: IBookingListTrip[] = [];

  public static createTripGroup(orderWithTripIdList: IBookingListItem[]): IBookingListTrip {
    return {
      air: this._isHasSegment(orderWithTripIdList, BookingType.Air),
      train: this._isHasSegment(orderWithTripIdList, BookingType.Train),
      transfer: this._isHasSegment(orderWithTripIdList, BookingType.Transfer),
      hotel: this._isHasSegment(orderWithTripIdList, BookingType.Hotel),
      bookings: orderWithTripIdList,
      tripId: orderWithTripIdList[0].tripId,
    };
  }

  private static _isHasSegment(orderList: IBookingListItem[], bookingType: BookingType): boolean {
    return !!orderList && orderList.filter((order: IBookingListItem) => this._bookingDictionary[order.typeId] === bookingType).length > 0;
  }

  constructor(obj?: Partial<IBookingListItem[]>) {
    this.orderList = [...obj];

    const tripGroups = this._groupBy(this.orderList.filter((order) => !!order.tripId), 'tripId');
    Object.keys(tripGroups).forEach((key) => {

      this.tripList.push(BookingDataSource.createTripGroup(tripGroups[key]));

      this.orderList
        .filter((order: IBookingListItem) => tripGroups[key].map((trip) => trip.id).includes(order.id))
        .forEach((order) =>
          this.orderList.splice(this.orderList.indexOf(order), 1),
        );

    });

  }

  public getDataSource(): (IBookingListItem | IBookingListTrip)[] {
    return this.tripList.concat(this.orderList);
  }

  private _groupBy(xs, key) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

}
