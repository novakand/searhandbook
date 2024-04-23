import { IBookingsTransferDetail } from '@components/bookings/interfaces/bookings-transfer-detail.interface';
import { IBookingOrderItemDetailsApi } from '@components/bookings/interfaces/booking-order-item-details.api.interface';

export class BookingOrderItemDetails implements IBookingsTransferDetail {

  public adult: string;
  public bookCode: string;
  public cancellationTerm: string;
  public comfort: string;
  public comment: string;
  public distance: string;
  public distancePostfix: string;
  public dropDown: string;
  public dropDownCoordinates: string;
  public duration: string;
  public luggage: string;
  public pets: string;
  public pickUp: string;
  public pickUpCoordinates: string;
  public pin: string;
  public pnr: string;
  public start: string;
  public url: string;
  public vehicleImg: string;
  public vehicleModel: string;
  public waitTime: string;
  public wheelChair: string;

  public providerName: string;
  public driver: string;
  public rateType: string;
  public meals: string;
  public description: string;
  public roomsAmount: number;
  public nights: string;
  public hotelName: string;
  public rating: string;
  public address: string;

  constructor(obj?: IBookingOrderItemDetailsApi[]) {

    const properties = obj.map((details) => details.name);

    properties.forEach((key) => {
      const detailsApi = obj.filter((detail) => detail.name === key)[0];

      if (!detailsApi) {
        return;
      }

      this[key] = detailsApi.value;

      switch (key) {
        case 'distance':
          this.distancePostfix = detailsApi.description;
          break;
        case 'dropDown':
          this.dropDownCoordinates = detailsApi.description;
          break;
        case 'pickUp':
          this.pickUpCoordinates = detailsApi.description;
          break;
        case 'waitTime':
          this[key] = `${detailsApi.value} ${detailsApi.description}`;
          break;
        case 'wheelChair':
          this[key] = String(Number(detailsApi.value.toLowerCase() === 'true'));
          break;
        default:
          break;
      }
    });

  }

}
