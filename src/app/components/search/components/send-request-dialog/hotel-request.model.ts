export class HotelRequest {

  public email: string;
  public message: string;
  public data: HotelInfo;

  constructor(obj: Partial<HotelRequest>) {
    Object.assign(this, obj);
  }

}

export class HotelInfo {

  public destination: string;
  public adultsPerRoom: number;
  public amountOfRooms: number;
  public arrival: string;
  public departure: string;
  public children: number[];

  constructor(obj: Partial<HotelInfo>) {
    Object.assign(this, obj);
  }

}
