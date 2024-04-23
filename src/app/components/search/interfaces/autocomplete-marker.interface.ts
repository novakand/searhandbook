import { IImages, IMarker, PointAddress } from 'h21-map';
import { Omit } from 'yargs';

export interface IAutocompleteMarker extends Omit<IMarker, 'address'> {
  address: PointAddress;
  photos?: IImages[];
  data?: any;
}
