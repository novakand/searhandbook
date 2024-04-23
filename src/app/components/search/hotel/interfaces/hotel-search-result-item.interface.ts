import { IFileInfo } from 'h21-be-ui-kit';
import { Position } from 'h21-map';

// interfaces
import { ITripAdvisorRating } from './trip-advisor-rating.interface';
import { IRoomsInfo } from './rooms-info.interface';
import { IEcoLabel } from './eco-label.interface';

export interface IHotelSearchResultItem {

  id?: number;
  image?: IFileInfo;
  images?: IFileInfo[];
  hotelName?: string;
  hotelAddress?: string;
  hotelRating?: number;
  distanceToPoiByFeet?: number;
  distanceToPoiByCar?: number;
  distanceByFeet?: number;
  distanceByCar?: number;
  ecoLabel?: IEcoLabel;
  hotelDescription?: string;
  tripAdvisorRating?: ITripAdvisorRating;
  providerRating?: IProviderRating;
  isRefundable?: boolean;
  showProviderImg?: boolean;
  facilities?: IFacilitie[];
  isFavorite?: boolean;
  hotelLocation?: Position;
  rooms?: IRoomsInfo;
  requestId?: string;
  brandPidMin?: IBrandPidMin;
  currency?: string;
  amount?: string;
  supplierName?: string;
  hasImages?: boolean;
  supplierLogoUrl?: string;
  roomsBatchId?: string;
}

export interface IBrandPidMin {
  brand: string;
  id: number;
  internalId: number;
  pid: string;
}

export interface IFacilitie {
  description?: string;
  id?: number;
  isVisible: boolean;
  name?: string;
  icon?: string;
}

export interface IProviderRating {
  description: string;
  rating: string;
}
