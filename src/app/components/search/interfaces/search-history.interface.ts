import { TransferFilter } from '@components/search/transfer';
import { HotelFilter } from '@components/search/hotel';
import { SearchKind } from '@app/enums';

export interface ISearchFilter {
  hotel: HotelFilter;
  transfer: TransferFilter;
  searchKind: SearchKind;
}
