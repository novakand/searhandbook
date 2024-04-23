export interface IHotelRoomsListItem {
  id: number;
  parentId: number;
  providerCode: string;
  breakfast: boolean;
  cancellationPolicy: any;
  price: number;
  excludingTax: number;
  negatiatedRate: number;
  geniusRate: number;
}
