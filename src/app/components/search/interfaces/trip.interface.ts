export interface ITrip {
  id?: number;
  name?: string;
  air?: boolean;
  transfer?:	boolean;
  hotel?: boolean;
  train?: boolean;
  orderItemsTypeCode?: string[];
}
