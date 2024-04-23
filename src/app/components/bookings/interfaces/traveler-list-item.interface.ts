import { ITraveler } from '@components/bookings/interfaces/traveler.interface';

export interface ITravelerListItem extends ITraveler {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  nationalityCode?: string;
  mobilePhone?: string;
  stateName?: string;
  photoFileHash?: string;
  createUserName?: string;

  isPrimary: boolean;
  customerCompanyName: string;
  address: string;
  city: string;
  countryCode: string;
  countryName: string;
  phoneNumber?: string;
}
