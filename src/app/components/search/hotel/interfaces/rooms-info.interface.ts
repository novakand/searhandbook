import { IFileInfo } from 'h21-be-ui-kit';

// interfaces
import { IRoomRate } from './room-rate.interface';
import { ITraveler } from '@components/search';

export interface IRoomsInfo {
  minCost: any;
  minTotalCost: any;
  minAveragePerNightCost: number;
  currency: string;
  roomRates: IRoomRate[];
  supplier: IFileInfo;
}

export interface IRoomDescription {
  extras: IExtra[];
  isAllowed: boolean;
  IsAllowedToExtras?: boolean;
  hotel: {
    image: {
      fileName: string;
      fileHash: string;
      fileSize: number;
      fileUrl: string;
      fileStorageId: number;
      folderId: number;
      name: string;
      description: string;
      id: number;
    };
    hotelName: string;
    hotelAddress: string;
    hotelRating: number;
    ecoLabel: {
      carbonFootprintCode: string;
      stayGreenCheck: string;
      carbonFootprintCo2: string;
    };
    tripAdvisorRating: {
      fileName: string;
      fileHash: string;
      fileSize: number;
      fileUrl: string;
      fileStorageId: number;
      folderId: number;
      name: string;
      description: string;
      id: number;
    };
    hotelLocation: {
      latitude: number;
      longitude: number;
    };
  };
  room: {
    id: string;
    roomType: string;
    description: string;
    boardingName: string;
    providerName: string;
    totalCost: number;
    averagePerNightCost: number;
    currency: string;
    isRefundable: boolean;
    penaltyDate: string;
    nightQuantity: number;
    rateDescription: string;
    cancelDescription: string;
    pricePerNightList: ICalendarRoom[];
  };
  searchParam: {
    arrival: string;
    departure: string;
    adultsPerRoom: number;
    amountOfRooms: number;
    children: number[];
    destination: string;
    primaryTraveler: ITraveler;
  };
}

export interface ICalendarRoom {
  cost: number;
  currency: string;
  date?: string;
}

export interface IExtra {
  code: string;
  description: string;
  id: number;
  name: string;
}
