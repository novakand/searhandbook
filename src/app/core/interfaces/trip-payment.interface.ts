import { SearchMode as QueryType } from '@components/search';
import { ICodeNamedEntity } from 'h21-be-ui-kit';

export interface ITrip {
  id: number;
  name: string;
  segments: ITripSegment[];
}

export interface ITripSegment {
  arrivalDate: string;
  bookingClass: string;
  cancellationDeadTime: string;
  cancellationTerm: string;
  currency: string;
  dropDown: string;
  hasExtras: boolean;
  isPaid: boolean;
  orderItemId: number;
  pickUp: string;
  price: number;
  providerLogo: string; // использовать providerType.logoBase64
  providerName: string; // использовать providerType.name
  providerType: IProviderTypeLogo;
  rate?: number;
  travelers: ITripTraveler[];
  type: QueryType;
  nonRefundable: boolean;
  cancellationClass?: string;
}

interface ITripTraveler {
  email: string;
  firstName: string;
  id: number;
  lastName: string;
  middleName: string;
  photoFileHash: string;
}

interface IProviderTypeLogo extends ICodeNamedEntity {
  logoBase64: string;
}
