import { IFileInfo } from 'h21-be-ui-kit';

export interface IPoi {
  locationUid?: string;
  comment?: string;
  tags?: string;
  arrayTags?: string[];
  location?: IPoiLocation;
  name?: string;
  description?: string;
  profileId?: number;
  id?: number;
}

export interface IPoiLocation {
  countryCode?: string;
  cityCode?: string;
  cityName?: string;
  airportCode?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  image?: IFileInfo;
  id?: number;
}
