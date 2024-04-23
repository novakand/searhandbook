import { PointType, RouteMode } from '@components/search/transfer';

export interface IRoute {
  startLatitude?: number;
  startLongitude?: number;
  startTypePoint?: PointType;
  endLatitude?: number;
  endLongitude?: number;
  endTypePoint?: PointType;
  fitBounds?: boolean;
  routeMode?: RouteMode;
  strokeColor?: string;
  strokeWeight?: number;
}
