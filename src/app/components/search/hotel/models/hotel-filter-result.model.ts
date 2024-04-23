import { CarbonFootprintType, PoiDistanceType, PriceType } from '../../hotel';

export class HotelFilterResult {

  public hotelNameLetters: string;
  public responseId: string;
  public batchIdEqual: string;
  public isRefundable: boolean;
  public isBreakfastIncluded: boolean;
  public priceGreaterEqual: number;
  public priceLessEqual: number;
  public firstHotelId: number;
  public distanceToPoiGreaterEqual: number;
  public priceCalculation: PriceType;
  public distanceToPoiLessEqual: number;
  public distanceLessEqual: number;
  public distanceToPoiCalculation: PoiDistanceType;
  public distanceCalculation: PoiDistanceType;
  public hotelPossibleRatings: number[];
  public minBookingRating: number;
  public facilities: string[];
  public suppliers: string[];
  public carbonFootprintCodes: CarbonFootprintType[];
  public isFavorite?: boolean;
  public batchesIdIn?: string[];
  public amountOfRooms: number;
  public adultsPerRoom: number;
  public arrival: string;
  public departure: string;
  public maxDistanceByCar: number;

  constructor(obj?: Partial<HotelFilterResult>) {
    Object.assign(this, obj);
  }

}
