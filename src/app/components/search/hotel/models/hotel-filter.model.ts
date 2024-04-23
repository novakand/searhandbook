// internal libs
import { Point } from 'h21-map';

// interfaces
import { IPoi } from '@components/search/hotel/components/hotel-poi/poi.interface';
import { ITraveler } from '@components/search';

// models
import { DrawAreaInfo } from '@components/search/models/draw-area-info.model';

export class HotelFilter {

  public destination: string;
  public hotelId: number;
  public poi: IPoi;
  public arrival: string;
  public departure: string;
  public adultsPerRoom: number;
  public amountOfRooms: number;
  public children: number[];
  public connectionId: string;
  public googlePlaceId: string;
  public point: Point;
  public drawInfo: DrawAreaInfo;
  public primaryTraveler: ITraveler;

  constructor(obj?: Partial<HotelFilter>) {
    Object.assign(this, obj);
  }

}
