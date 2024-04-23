import { AnimateType, IImages, PointAddress } from 'h21-map';
import { ViewMode } from 'h21-be-ui-kit';

// enums
import { LocationType, PointType } from '@components/search/transfer/enums';

export interface IMarker {
  latitude: number;
  longitude: number;
  fitBounds?: boolean;
  address?: string;
  addressDetails?: PointAddress;
  iconUrl: string;
  labelContent?: string;
  labelClass?: string;
  isLabelActive?: boolean;
  photos?: IImages[];
  title?: string;
  isCluster?: boolean;
  iconWidth?: number;
  iconHeight?: number;
  iconZIndex?: number;
  typePoint?: PointType;
  point?: LocationType;
  data?: any;
  animate?: AnimateType;
}

export interface IPoiDataAction {
  value?: any;
  action?: ViewMode;
}
