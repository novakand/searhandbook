import { IEntity } from 'h21-be-ui-kit';

export interface ITraveler extends IEntity {
  firstName?: string;
  lastName?: string;
  middleName?: string;
}
