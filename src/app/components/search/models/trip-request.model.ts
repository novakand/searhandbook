import { TripHotel, TripTransfer } from '@components/search/models';

export class TripRequest {

  public h21ProLogin: number;
  public requestName: string;
  public tripRequestAir: any;
  public tripRequestHotel: TripHotel;
  public travelerIds: number[];
  public tripRequestTransfer: TripTransfer;

  constructor(props?: Partial<TripRequest>) {
    Object.assign(this, props);
  }

}
