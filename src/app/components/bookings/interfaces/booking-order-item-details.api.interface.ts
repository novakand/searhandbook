import { IEntity } from 'h21-be-ui-kit';

export interface IBookingOrderItemDetailsApi extends IEntity {
  orderItemId?: string;
  name?: string;
  type?: string;
  value?: string;
  caption?: string;
  description?: string;
  size?: string;
}
