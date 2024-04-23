import { AnimateType, IImages, Point, PointAddress } from 'h21-map';

// interfaces
import { IHotelSearchResultItem } from '@components/search/hotel/interfaces';

export class Marker {

  public latitude: number;
  public longitude: number;
  public fitBounds = true;
  public photos: IImages[];
  public iconUrl: string;
  public iconHeight: number;
  public labelContent?: string;
  public labelClass?: string;
  public isLabelActive?: boolean;
  public typePoint: any;
  public iconZIndex = 99;
  public isCluster?: boolean;
  public animate: AnimateType;
  public addressDetails: PointAddress;
  public data: IHotelSearchResultItem;
  public dataPoint?: Point;

  constructor(obj?: Partial<Marker>) {
    Object.assign(this, obj);
  }

}
