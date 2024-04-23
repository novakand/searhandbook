export interface IHotelGeneralInfo {
  latitude: number;
  longitude: number;
  ratings: IRating[];
  zipCode: string;
  countryIso: string;
  name: string;
  country: string;
  city: string;
  address: string;
  region: string;
  location: string;
  languageId: number;
  smallImage: ISmallImage;
  star?: number;
  isFavorite: boolean;
  id: number;
  amount?: string;
  currency?: string;
  supplierName?: string;
  supplierLogoUrl?: string;
}

export interface IHotelLocationFilter {
  geoDistance: {
    centerPoint: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
  requestId: string;
}

export interface IRating {
  value: number;
  image: IImage;
  type: any;
  hotelId: number;
  id: number;
}

export interface IImage {
  url: string;
  type: string;
  name: string;
  description: string;
  id: number;
}

export interface ISmallImage {
  fileName: string;
  fileHash: string;
  fileSize: number;
  fileUrl: string;
  fileStorageId: number;
  folderId: number;
  name: string;
  description: string;
  id: number;
}
