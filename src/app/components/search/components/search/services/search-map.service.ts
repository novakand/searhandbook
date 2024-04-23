import { Inject, Injectable } from '@angular/core';

// environment
import { environment } from '@environments/environment';

// external libs
import { takeUntil } from 'rxjs/operators';
import { ViewMode } from 'h21-be-ui-kit';
import { camelCase } from 'lodash';

// inner libs
import {
  AreaEvent,
  ChangesMap,
  CircleEvent,
  ClientPosition,
  CursorType,
  DrawingModes,
  EventPosition,
  LanguageCode,
  MapType,
  MarkerEvent,
  MarkerIconSvg,
  MarkerIconSvgSelected,
  Point,
  RouteInfo,
  RouteMode,
} from 'h21-map';

// builders
import { SearchMapBuilder } from '../search-map.builder';

// enums
import { DrawType, PointType } from '@components/search/hotel/enums';
import { LocationType } from '@components/search/transfer/enums';

// components
import { SearchComponent } from '../search.component';

// models
import { DrawAreaInfo } from '@components/search/models/draw-area-info.model';
import { Marker } from '@components/search/hotel/models';

// services
import { HistorySearchService } from '@core/services';
import { Subject } from 'rxjs';

@Injectable()
export class SearchMapService {

  public cmp: SearchComponent;

  public hotelClick$ = new Subject<number>();
  public destination$ = new Subject<Marker>();

  constructor(
    private _history: HistorySearchService,
  ) { }

  public onChangedDrawingMode(type: DrawingModes): void {
    this.cmp.currentDrawMode = type;
    switch (type) {
      case DrawingModes.circle:
      case DrawingModes.area:
        this.cmp.mapOptions.defaultCursor = CursorType.crosshair;
        break;
      case DrawingModes.marker:
        this.cmp.mapOptions.defaultCursor = CursorType.crosshair;
        break;
      default:
        this.cmp.mapOptions.defaultCursor = CursorType.default;
        this.cmp.markerClusterOptions.changesMap = ChangesMap.bbox;
        break;
    }
  }

  public onAutocompleteSelected(point: Point): void {
    this._setInfoBoxContentDrawMarker(point);
    this.cmp.drawingOptions.isDraw = false;
    this.cmp.drawingOptions.drawMode = DrawingModes.reset;
    this.cmp.cdr.detectChanges();
    this.cmp.drawingOptions.markerLatitude = point.position.latitude;
    this.cmp.drawingOptions.markerLongitude = point.position.longitude;
    this.cmp.drawingOptions.drawMode = DrawingModes.marker;
    this.cmp.onClearForm();
    this.cmp.cdr.detectChanges();
    this.cmp.map.manager.getMap().drawing.isAnimateMarker(true);
  }

  public onAutocomleteClickReset(): void {
    this.cmp.drawingOptions.markerData = null;
    this.cmp.resetToolbarDraw();
    this.cmp.map.manager.getMap().drawing.resetMarker();
  }

  public onMapClick(event: EventPosition): void {
    if (this.cmp.sidenavViewContent !== 'transferSearch') { return; }
    this.cmp.contextMenu.closeMenu();
    this.cmp.position = event.position;
  }

  public onMapRightClick(event: ClientPosition): void {
    if (this.cmp.sidenavViewContent !== 'transferSearch') { return; }
    this.cmp.contextMenuPosition.x = `${event.clientX}px`;
    this.cmp.contextMenuPosition.y = `${event.clientY}px`;
    this.cmp.contextMenu.menuData = { item: event.position };
    this.cmp.contextMenu.openMenu();
  }

  public onMarkerDrawClick(marker: Marker): void {
    if (!marker || this.cmp.sidenavViewContent !== 'poi') { return; }
    this.cmp.poi = SearchMapBuilder.buildPoi(marker, marker.addressDetails);
    this.cmp.poiDataAction = { value: this.cmp.poi, action: ViewMode.Add };
    this.cmp.cdr.detectChanges();
  }

  public onMarkerDrawCreate(event: MarkerEvent): void {
    if (this.cmp.sidenavViewContent !== 'poi') { return; }
    if (event.isDraw) {
      event.placeId && this.getDetails(event.placeId);
      !event.placeId && this.getAddress(event.position.latitude, event.position.longitude);
      this.cmp.resetAutoComplete(true);
    }
  }

  public onMarkerClick(marker: Marker): void {
    if (!marker) { return; }
    switch (this.cmp.sidenavViewContent) {
      case 'poi':
        this._onPoiClick(marker);
        break;
      case 'hotelSearch':
        this._onHotelSearchMarkerClick(marker);
        break;
    }
  }

  public routeReady(route: RouteInfo): void {
    if (!route || route.routeMode === RouteMode.transit) { return; }
    this.cmp.markers = [];
    this.cmp.addMarker([SearchMapBuilder.buildMarkerRoute(route, LocationType.pickUp)]);
    this.cmp.addMarker([SearchMapBuilder.buildMarkerRoute(route, LocationType.dropDown)]);

    this.cmp.routeImgUrl = route.staticUrl;
    this.cmp.storage.staticUrl$.next(route.staticUrl);
    setTimeout(() => this.cmp.map.manager.getMap().route.fitBounds(), 1000);

    if (!route.routePosition) { return; }
    if (this._routeExist(route)) { return; }

    this.cmp.routes.push(SearchMapBuilder.buildRoute(route, LocationType.pickUp));
    this.cmp.routes.push(SearchMapBuilder.buildRoute(route, LocationType.dropDown));
    this.cmp.cdr.detectChanges();

  }

  public removeMarkers(): void {
    this.cmp.markers = [];
    this.cmp.addMarker([]);
    this.cmp.cdr.detectChanges();
  }

  public onRadiusChange(event: CircleEvent): void {
    this.cmp.circleChange = event;
    this.cmp.tooltipOptions.clientX = event.pixel.clientX;
    this.cmp.tooltipOptions.clientY = event.pixel.clientY;

    let unitRadius = 'm';
    let valueRadius = event.radius;
    if (valueRadius > 1000) {
      unitRadius = 'km';
      valueRadius = Number((parseFloat(valueRadius.toString()) / 1000).toFixed(1));
    }

    this.cmp.tooltipOptions.title = valueRadius.toString();
    this.cmp.tooltipOptions.value = unitRadius;
    this.cmp.tooltipOptions.isShow = true;
  }

  public onRadiusCenterChange(event: CircleEvent): void {
    this.cmp.tooltipOptions.isShow = false;
    this.cmp.circleChange = event;
  }

  public onMarkerMouseOverCluster(event): void {
    if (event.data) {
      this.cmp.infoBoxOptions.clientX = event.clientX;
      this.cmp.infoBoxOptions.clientY = event.clientY;
      this.cmp.infoBoxOptions.hotel = event.data;
      this.cmp.infoBoxOptions.isShow = true;
    }
  }

  public onMarkerMouseOutCluster(): void { this.cmp.infoBoxOptions.isShow = false; }

  public onMarkerMouseOver(event, marker: Marker): void {
    if (!marker || this.cmp.sidenavViewContent === 'transferSearch') { return; }
    if (marker.data) {
      this.cmp.infoBoxOptions.clientX = event.clientX;
      this.cmp.infoBoxOptions.clientY = event.clientY;
      this.cmp.infoBoxOptions.hotel = marker.data;
      this.cmp.infoBoxOptions.isShow = true;
    }

    marker.iconUrl = `${environment.iconsUri}${MarkerIconSvgSelected[camelCase(marker.typePoint)]}`;
    marker.iconZIndex = 1006;
  }

  public onMarkerMouseOut(marker: Marker): void {
    if (!marker || this.cmp.sidenavViewContent === 'transferSearch') { return; }
    marker.iconUrl = `${environment.iconsUri}${MarkerIconSvg[camelCase(marker.typePoint)]}`;
    this.cmp.infoBoxOptions.isShow = false;
    marker.iconZIndex = 1005;
  }

  public onAreaCreate(event: AreaEvent): void {
    this.cmp.markerClusterOptions.changesMap = ChangesMap.draw;
    this.cmp.drawInfo = new DrawAreaInfo({
      type: DrawType.area,
      area: event,
    });
  }

  public onRadiusComplete(event: CircleEvent): void {
    this.cmp.markerClusterOptions.changesMap = ChangesMap.draw;
    this.cmp.tooltipOptions.isShow = false;
    this.cmp.drawInfo = new DrawAreaInfo({
      type: DrawType.circle,
      circle: event,
    });
    this.cmp.markers = [ ...this.cmp.poiMarkers ];
    this.cmp.cdr.detectChanges();
  }

  public getAddress(latitude: number, longitude: number): void {
    this.cmp.map.manager.getMap().geocoding.getAddress(latitude, longitude)
      .pipe(takeUntil(this.cmp.destroy$))
      .subscribe({
        next: (point: Point) => {
          this._setInfoBoxContentDrawMarker(point);
          this.cmp.map.manager.getMap().drawing.isAnimateMarker(true);
        },
      });
  }

  public getDetails(placeId: string): void {
    this.cmp.map.manager.getMap().search.searchDetails(placeId)
      .pipe(takeUntil(this.cmp.destroy$))
      .subscribe({
        next: (point: Point) => {
          this._setInfoBoxContentDrawMarker(point);
          this.cmp.map.manager.getMap().drawing.isAnimateMarker(true);
        },
      });
  }

  public onMapFitBounds(): void {
    switch (true) {
      case this.cmp.sidenavViewContent === 'poi':
      case this.cmp.sidenavViewContent === 'favorites':
        this._fitBoundOrSetCenter();
        break;
      case this.cmp.sidenavViewContent === 'transferSearch':
        this.cmp.markerClusterOptions.changesMap = ChangesMap.draw;
        break;
    }
  }

  public initMap(): void {
    this.cmp.mapOptions = SearchMapBuilder.buildMapOptions();
    this.cmp.routeOptions = SearchMapBuilder.buildRouteOptions();
    this.cmp.drawingOptions = SearchMapBuilder.buildDrawOptions();
    this.cmp.infoBoxOptions = SearchMapBuilder.buildInfoBoxOptions();
    this.cmp.tooltipOptions = SearchMapBuilder.buildTooltipOptions();
    this.cmp.markerClusterOptions = SearchMapBuilder.buildClusterOptions();
  }

  public cleanUp(): void {
    this.cmp.markers = [];
    this.cmp.poi = null;
    this.cmp.marker = null;
    this.cmp.position = null;
    this.cmp.drawInfo = null;
    this.cmp.poiDataAction = null;
    this.onAutocomleteClickReset();
    this.cmp.mapOptions.defaultCursor = CursorType.default;
  }

  public resetMap(isClear: boolean): void {
    this.cmp.map.manager.getMap().drawing.remove();
    this.cmp.map.manager.getMap().route.removeRoutes();
    isClear && this.cmp.map.manager.getMap().markerCluster.clearMarkerCluster();
    this.cmp.drawingOptions.markerData = null;

    (this.cmp.sidenavViewContent === 'hotelSearch') ? this.markerClusterRedraw()
      : this.cmp.markerClusterOptions.changesMap = ChangesMap.draw;
  }

  public resetMarkerClusterOptions(): void {
    this.cmp.map.manager.getMap().markerCluster.clearMarkerCluster();
    this.cmp.markerClusterOptions.changesMap = ChangesMap.draw;
  }

  public markerClusterRedraw(): void {
    this.cmp.markerClusterOptions.changesMap = ChangesMap.bbox;
    this.cmp.map.manager.getMap().markerCluster.resizeBounds();
  }

  private _fitBoundOrSetCenter(): void {
    if (this.cmp.markers.length) {
      this._fitBounds();
      return;
    }
    const { latitude, longitude, zoom } = this.cmp.mapOptions;
    this.cmp.map.manager.getMap().setCenter(latitude, longitude, zoom);
  }

  private _onHotelSearchMarkerClick(marker: Marker): void {
    if (marker.typePoint !== PointType.destination) {
      this.hotelClick$.next(marker.data.id);
    } else {
      this.destination$.next(marker);
    }
  }

  private _onPoiClick(marker: Marker): void {
    const data = this.cmp.markers.find((v) => v.longitude === marker.longitude && v.latitude === marker.latitude);
    if (data.data.id) { this.cmp.poiDataAction = { value: data, action: ViewMode.Edit }; }
    this.cmp.cdr.detectChanges();
  }

  private _setInfoBoxContentDrawMarker(point: Point): void {
    this.cmp.drawingOptions.markerData = null;
    this.cmp.marker = SearchMapBuilder.buildMarker(point);
    this.cmp.drawingOptions.markerData = this.cmp.marker;
  }

  private _routeExist(route: RouteInfo): boolean {
    const point = route.routePosition;
    const startPoint = point.startPosition;
    const endPoint = point.endPosition || null;
    const isEqualLatitude = startPoint.latitude === endPoint.latitude;
    const isEqualLongitude = startPoint.longitude === endPoint.longitude;
    return (!point || (isEqualLatitude && isEqualLongitude));
  }

  private _fitBounds(): void {
    this.cmp.map.manager.getMap().markerCluster.clearMarkerCluster();
    setTimeout(() => this.cmp.isReady && this.cmp.map.manager.getMap().fitBounds(), this.cmp.isRestore ? 1000 : 100);
  }

}
