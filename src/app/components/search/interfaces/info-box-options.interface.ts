import { IHotelSearchResultItem } from '@components/search/hotel/interfaces';

export interface IInfoBoxOptions {
  clientX?: number;
  clientY?: number;
  isShow?: boolean;
  hotel?: IHotelSearchResultItem;
}
