import { IEcoLabel } from './eco-label.interface';

export interface IFavorites {
  count: number;
  items: IFavorite[];
}

export interface IFavorite {
  hotelGeneralInfo: {
    amenityIds: number[];
    countryIso: string;
    disable: boolean;
    fileImages: IFavoriteImage[];
    hotelDetail: string;
    ecoLabel?: IEcoLabel;
    hotelGeneralInfoLanguages: IHotelInfoFavorite[];
    latitude: number;
    longitude: number;
    ratings: IRatingHotel;
    typeId: number;
    zipCode: string;
    smallImage: IFavoriteImage;
    id: number;
  };
  id: number;
  profileId: number;
}

export interface IRatingHotel {
  ecoLabel: {
    carbonFootprintCo2: string;
    carbonFootprintCode: number;
    stayGreenCheck: number;
  };
  isFavorite: boolean;
  starRating: number;
  tripAdvisorRating: number;
}

export interface IFavoriteImage {
  description: string;
  id: number;
  name: string;
  type: string;
  url: string;
  fileUrl: string;
  fileHash: string;
  fileName: string;
  fileSize: string;
  fileStorageId: string;
  folderId: string;
}

export interface IHotelInfoFavorite {
  address: string;
  city: string;
  country: string;
  hotelId: number;
  id: number;
  languageId: number;
  location: string;
  name: string;
  region: string;
}

export interface IFavoriteFilter {
  hotelNameContains: string;
}
