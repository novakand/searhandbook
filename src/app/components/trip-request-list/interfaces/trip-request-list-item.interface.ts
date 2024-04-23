import { IEntity } from 'h21-be-ui-kit';

export interface ITripRequestListItem extends IEntity {
  name?: string;
  departure?: string;
  arrival?: string;
  city?: string;
  pickUp?: string;
  dropDown?: string;
  from?: string;
  to?: string;
  dateOfCreation?: string;
  travelersCount: number;
  sharedState: number;
  air?: boolean;
  transfer?:	boolean;
  hotel?: boolean;
  train?: boolean;
}
