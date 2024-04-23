export class TripHotel {

  public arrivalDate: Date;
  public departureDate: Date;
  public location: TripHotelLocation;

  constructor(obj?: Partial<TripHotel>) {
    Object.assign(this, obj);
  }

}

export class TripHotelLocation {

  public longitude: string;
  public latitude: string;
  public countryCode: string;
  public cityCode: string;
  public airportCode: string;
  public cityName: string;
  public countryName: string;

  constructor(public address: string) {}

}
