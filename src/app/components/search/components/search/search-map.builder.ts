// environment
import { environment } from '@environments/environment';

// interfaces
import { IInfoBoxOptions, IMapOptions, IMarker, ITooltipOptions } from '@components/search/interfaces';
import { IPoi } from '@components/search/hotel/components/hotel-poi/poi.interface';
import { IRouteOptions } from '@search/interfaces/route-options.interface';

// internal libs
import {
  ChangesMap,
  DrawingModes,
  IDrawingOptions,
  IMarkerClusterOptions,
  LanguageCode,
  MapStateOptions,
  MapType,
  MarkerIcon,
  MarkerIconSvg,
  Point,
  PointAddress,
  Position,
  RouteInfo
} from 'h21-map';

// models
import { Marker } from '@components/search/hotel/models';
import { Route } from '../../models/route-map-model';

// enums
import { LocationType, PointType } from '@components/search/transfer/enums';
import { RouteMode } from '../../transfer/enums/route-mode.enum';

export class SearchMapBuilder {

  public static buildMarkerByPosition(position: Position, point: LocationType): IMarker {
    return {
      latitude: position.latitude,
      longitude: position.longitude,
      iconUrl: `${environment.iconsUri}${MarkerIconSvg[point]}`,
      iconHeight: 24,
      iconZIndex: 99,
      isCluster: true,
      point: point,
      typePoint: PointType[point],
    };
  }

  public static buildMarkerRoute(route: RouteInfo, type: LocationType): IMarker {
    const position = type === LocationType.pickUp
      ? route.originPosition.startPosition
      : route.originPosition.endPosition;
    return {
      latitude: position.latitude,
      longitude: position.longitude,
      iconZIndex: 99,
      isCluster: false,
      iconUrl: `${environment.iconsUri}${MarkerIconSvg[type]}`,
      point: LocationType[type],
      typePoint: PointType[type],
    };
  }

  public static buildMarker(point: Point): Marker {
    return new Marker({
      iconUrl: MarkerIcon.destination,
      typePoint: PointType.destination,
      latitude: point.position.latitude,
      longitude: point.position.longitude,
      isCluster: true,
      iconHeight: 24,
      animate: null,
      addressDetails: point.address,
      data: {
        hotelName: point.name,
        image: {
          fileUrl: point.photos && point.photos[0].url,
        },
        hotelAddress: (point.address) && point.address.description,
      },
    });
  }

  public static buildPoi(marker: IMarker, address: PointAddress): IPoi {
    return {
      name: marker.data.hotelName,
      location: {
        cityName: address && address.city,
        countryCode: address && address.countryCode,
        address: marker.data.hotelAddress,
        latitude: marker.latitude,
        longitude: marker.longitude,
        image: {
          fileUrl: marker.data.image.fileUrl,
        },
      },
    };
  }

  public static buildRoute(route: RouteInfo, type: LocationType): Route {
    const positionOrigin = type === LocationType.pickUp
      ? route.originPosition.startPosition
      : route.originPosition.endPosition;
    const positionRoute = type === LocationType.pickUp
      ? route.routePosition.startPosition
      : route.routePosition.endPosition;

    const routeTransit = new Route();
    routeTransit.startLatitude = positionOrigin.latitude;
    routeTransit.startLongitude = positionOrigin.longitude;
    routeTransit.endLatitude = positionRoute.latitude;
    routeTransit.endLongitude = positionRoute.longitude;
    routeTransit.strokeColor = '#0051FF';
    routeTransit.strokeWeight = 4;
    routeTransit.strokeOpacity = 0.9;
    routeTransit.routeMode = RouteMode.transit;
    return routeTransit;
  }

  public static buildDrawCircle(event: MapStateOptions): IDrawingOptions {
    return {
      drawMode: DrawingModes.circle,
      circleRadius: event.drawCircle.radius,
      markerLatitude: event.drawCircle.position.latitude,
      markerLongitude: event.drawCircle.position.longitude,
      isRedraw: Boolean(event.drawMode.mode),
    };
  }

  public static buildDrawMarker(event: MapStateOptions): IDrawingOptions {
    return {
      drawMode: DrawingModes.marker,
      markerLatitude: event.drawMarker.position.latitude,
      markerLongitude: event.drawMarker.position.longitude,
      isRedraw: Boolean(event.drawMode.mode),
    };
  }

  public static buildDrawArea(event: MapStateOptions): IDrawingOptions {
    return {
      drawMode: DrawingModes.area,
      areaCoordinates: event.drawArea.position,
      isRedraw: Boolean(event.drawMode.mode),
    };
  }

  public static buildInfoBoxOptions(): IInfoBoxOptions {
    return {
      clientX: 0,
      clientY: 0,
      isShow: false,
      hotel: null,
    };
  }

  public static buildDrawOptions(): IDrawingOptions {
    return {
      circleMaxRadius: 15000,
      circleRadius: 5000,
      circleFitBounds: true,
      drawMode: null,
      markerLatitude: 0,
      markerLongitude: 0,
      markerFitBounds: true,
      isDraw: false,
      areaCoordinates: [],
      areaFitBounds: true,
      markerIconUrl: `${environment.iconsUri}${MarkerIconSvg.destination}`,
      circleIconUrl: `${environment.iconsUri}${MarkerIconSvg.drawCircle}`,
    };
  }

  public static buildMapOptions(): IMapOptions {
    return {
      latitude: 55.729823,
      longitude: 37.640596,
      language: this._getLangMap(),
      zoom: 3,
      minZoom: 3,
      maxZoom: 19,
      fitBounds: true,
      preloaderIsOpen: false,
      provider: this._getProviderMap(),
      enableDefaultControl: false,
      isClick: true,
      defaultCursor: 'default',
    };
  }

  public static buildRouteOptions(): IRouteOptions {
    return {
      startIconUrl: `${environment.iconsUri}${MarkerIconSvg.startIconStatic}`,
      endIconUrl: `${environment.iconsUri}${MarkerIconSvg.endIconStatic}`,
    };
  }

  public static buildTooltipOptions(): ITooltipOptions {
    return {
      clientX: 0,
      clientY: 0,
      isShow: false,
      value: '',
      title: 'radius',
    };
  }

  public static buildClusterOptions(): IMarkerClusterOptions {
    return {
      apiUrl: environment.apiHotelUri,
      minClusterSize: 5,
      changesMap: ChangesMap.bbox,
    };
  }

  private static _getProviderMap(): MapType {
    return MapType[sessionStorage.getItem('selectedMap')] || MapType.google;
  }

  private static _getLangMap(): LanguageCode {
    return LanguageCode[sessionStorage.getItem('selectedMapLang')] || LanguageCode.en;
  }

}
