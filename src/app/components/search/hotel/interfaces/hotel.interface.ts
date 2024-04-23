// internal libs
import { Position } from 'h21-map';

// enums
import { CarbonFootprintType } from '@hotel/enums';

// interfaces
import { IFacilitie } from './hotel-search-result-item.interface';

export interface IHotel {
  image?: IHotelImage;
  images: IHotelImage[];
  hotelName: string;
  hotelAddress: string;
  hotelRating: number;
  distanceByFeet: number;
  distanceByCar: number;
  ecoLabel: IHotelEcoLabel;
  tripAdvisorRating: IHotelTripAdvisorRating;
  hotelLocation: Position;
  facilities: IFacilitie[];
  isFavorite: boolean;
  id: number;
}

export interface IHotelImage {
  fileUrl: string;
}

export interface IHotelEcoLabel {
  carbonFootprintCode: CarbonFootprintType;
  stayGreenCheck: number;
  carbonFootprintCo2: number;
}

export interface IHotelTripAdvisorRating {
  fileUrl: string;
  description: string;
}
