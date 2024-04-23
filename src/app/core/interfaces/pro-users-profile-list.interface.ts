import { ICodeNamedEntity } from 'h21-be-ui-kit';

export interface IH21ProUsersProfileList extends ICodeNamedEntity {
  companyName?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  function?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}
