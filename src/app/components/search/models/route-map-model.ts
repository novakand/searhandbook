import { RouteMode } from '../transfer/enums/route-mode.enum';

export class Route {

    public startLatitude: number;
    public startLongitude: number;
    public endLatitude: number;
    public endLongitude: number;
    public routeMode: RouteMode;
    public strokeColor?: string;
    public strokeOpacity?: number;
    public strokeWeight?: number;

}
