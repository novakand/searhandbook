import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatMenuTrigger, MatSidenav } from '@angular/material';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// external libs
import { filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

// enums
import { LocationType, PointType } from '@components/search/transfer/enums';
import { MarkerAction } from '../../enums';

// internal libs
import {
  ChangesMap,
  CircleEvent,
  CursorType,
  DrawingModes,
  H21MapAutocompleteComponent,
  H21MapComponent,
  H21MapDrawingManagerComponent,
  IMarkerClusterOptions,
  MapStateOptions,
  Position,
} from 'h21-map';

// models
import { DrawAreaInfo } from '@components/search/models/draw-area-info.model';
import { MarkerActionInfo } from '@components/search/models';

// builders
import { SearchMapBuilder } from './search-map.builder';

// interfaces
import {
  IDrawingOptions, IInfoBoxOptions, IMapOptions, IMarker,
  IPoiDataAction, IRoute, ITooltipOptions, ITraveler,
} from '../../interfaces';
import { IPoi } from '@components/search/hotel/components/hotel-poi/poi.interface';
import { IRouteOptions } from '../../interfaces/route-options.interface';

// mapServices
import { SearchMapService } from './services/search-map.service';
import { SearchService } from './services/search.service';
import { StorageService } from '@core/services';
import { Utils } from 'h21-be-ui-kit';
import { SearchSidenavService } from './services/search-sidenav.service';

@Component({
  selector: 'h21-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchMapService, SearchService],
})
export class SearchComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('map') public map: H21MapComponent;
  @ViewChild(MatMenuTrigger) public contextMenu: MatMenuTrigger;

  public togglePoi = true;
  public showPoi = false;
  public showNavigation = false;

  public routeImgUrl: string;
  public point = LocationType;

  public tabletMode: boolean;
  public sidenavViewContent: string;

  public isReady: boolean;
  public isRestore: boolean;

  public booker: ITraveler;
  public travelersList: ITraveler[] = [];

  public poi: IPoi;
  public poiDataAction: IPoiDataAction = {};

  public marker: IMarker;
  public position: Position;
  public currentDrawMode: DrawingModes;
  public circleChange: CircleEvent;

  public drawInfo: DrawAreaInfo;

  public routes: IRoute[] = [];
  public markers: IMarker[] = [];
  public poiMarkers: IMarker[] = [];

  public isHotelSearch: boolean;
  public mapOptions: IMapOptions;
  public drawingOptions: IDrawingOptions;
  public infoBoxOptions: IInfoBoxOptions;
  public markerClusterOptions: IMarkerClusterOptions;
  public routeOptions: IRouteOptions;
  public tooltipOptions: ITooltipOptions;

  public contextMenuPosition = { x: '0px', y: '0px' };
  public sidenavContentViewContent: 'map' | 'outlet' = 'map';

  public infoBoxImages: Record<number, Observable<string>> = {};

  public destroy$ = new Subject<boolean>();

  @ViewChild('drawManager') private _drawManager: H21MapDrawingManagerComponent;
  @ViewChild('mapAutoComplete') private _mapAutoComplete: H21MapAutocompleteComponent;
  @ViewChild('sidenav') private _sidenav: MatSidenav;

  constructor(
    private _router: Router,
    public cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _service: SearchService,
    public storage: StorageService,
    public mapService: SearchMapService,
    public sidenavService: SearchSidenavService,
    private _breakpointObserver: BreakpointObserver,
  ) {
    this.mapService.cmp = this;
    this.mapService.initMap();

    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        if (this.tabletMode) {
          this.sidenavService.opened$.subscribe((opened) => {
            this._sidenav.opened = opened;
            this.cdr.markForCheck();
          });
        } else {
          this.sidenavViewContent !== 'none' && this._sidenav.open();
        }
        this.cdr.markForCheck();
      });
  }

  public ngOnInit(): void {
    this._setIsHotelSearch(this._router.url);
    this._service.checkAccessToRoute();
    this._sidenavInit();
    this._onRouteChangedListener();
    this._routeEventListener();
  }

  public ngAfterViewInit(): void { this._sidenavToggle(); }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.showPoi = false;
  }

  public trackByFn(index: number): number { return index; }

  public onIsRestore(isRestore: boolean) {
    this.mapService.resetMarkerClusterOptions();
    this.isRestore = isRestore;
  }

  public onDrawingOptionsChange(event: IDrawingOptions): void {
    this.resetToolbarDraw();
    this.drawingOptions.drawMode = DrawingModes.reset;
    this.cdr.detectChanges();
    this.drawingOptions = { ...this.drawingOptions, ...event };
    this.cdr.detectChanges();
  }

  public updatePoiList(value: boolean): void {
    const poiIds = this.poiMarkers.map((v) => v.data.id);
    this.markers = !value ? this.markers.filter((v) => !poiIds.includes(v.data.id)) : Utils.deepCopy(this.poiMarkers);

    this.setMarkersList(new MarkerActionInfo({
      markers: this.markers,
      action: MarkerAction.CLEAR_AND_ADD,
    }), false, true);
    this.cdr.detectChanges();
  }

  public onMapReady(isReady: boolean): void {
    this.isReady = isReady;
    if (isReady) {
      const copied = this._refreshMarkers();
      this.markers.push(...copied);

      this.storage.manager$.next(this.map.manager);
    }
  }

  public onMapUpdateReady(event: MapStateOptions): void {
    sessionStorage.setItem('selectedMap', this.map.provider);
    sessionStorage.setItem('selectedMapLang', this.map.language);

    if (this.isRestore) { return; }
    this.mapService.onMapFitBounds();
    (event.drawArea || event.drawCircle) && this.mapService.removeMarkers();
    event.drawArea && this._redrawArea(event);
    event.drawCircle && this._redrawCircle(event);
    event.drawMarker && this._redrawMarker(event);
    (event.routes && this.sidenavViewContent === 'transferSearch') && this._redrawRoutes(event);
  }

  public onRoute(position: Position, point: LocationType): void {
    this.marker = SearchMapBuilder.buildMarkerByPosition(position, point);
  }

  public onClearForm(): void {
    this.mapOptions.defaultCursor = CursorType.default;
    this.resetToolbarDraw();
    this.markers = [];
    this.addMarker([]);
  }

  public onChangeDestination(): void { this.resetToolbarDraw(); }

  public onTrackMapCluster(trackMode: ChangesMap) { this.markerClusterOptions.changesMap = trackMode; }

  public onTransferChanged(marker: IMarker): void {
    this.markers = this.markers.filter((item) => item.point !== marker.point);
    if (this.markers.length > 0 || this.routes.length > 0) {
      this.map.manager.getMap().fitBonds = false;
    }
    this.markers.push(marker);
    this.cdr.detectChanges();
  }

  public removeByType(type: PointType): void {
    this.markers = this.markers.filter((item) => item.typePoint !== type);
    this.cdr.detectChanges();
  }

  public addMarker(markers: IMarker[]): void {
    this.showPoi = true;
    this.markers.push(...markers, ...this.poiMarkers);
    this.cdr.detectChanges();
  }

  public resetPoi(): void {
    this.poiMarkers = [];
    this.togglePoi = false;
    this.showPoi = false;
  }

  public setMarkersList(info: MarkerActionInfo, isPoi?: boolean, resetMarkers?: boolean): void {
    const copied = this._refreshMarkers();
    this.markers = (MarkerAction.ADD === info.action) ? [...copied, ...info.markers] : [...info.markers];
    this.markers.forEach((v) => {
      v.animate = null;
      if (v.data.image && Object.keys(v.data.image).length && v.data.image.fileHash) {
        this.infoBoxImages[v.data.id] = this._service.loadImg(v.data.image);
      }
    });

    this.mapService.onMapFitBounds();
    !resetMarkers && (this.map.manager.getMap().drawing && this.map.manager.getMap().drawing.resetMarker());

    if (isPoi) {
      this.poiMarkers = this.markers;
      this.togglePoi = true;
      this.showPoi = true;
      this.cdr.detectChanges();
    }
  }

  public onDrawMarker(mode: DrawingModes): void {
    if (mode === DrawingModes.marker) {
      this.mapOptions.isClick = true;
      this.mapOptions.defaultCursor = CursorType.crosshair;
    }
  }

  public onRouteReady(route: IRoute): void {
    this.routes = [];
    this.markers = [];
    this.poi = null;
    this.marker = null;
    this.resetAutoComplete();
    this.map.manager.getMap().route.removeRoutes();
    this.cdr.detectChanges();
    if (route) {
      this.mapOptions.isClick = false;
      this.mapOptions.defaultCursor = CursorType.default;
      this.addRoute(route);
    }
  }

  public addRoute(route: IRoute): void {
    this.routes.push(route);
    this.cdr.detectChanges();
  }

  public removeRoutes(): void {
    this.routes = [];
    this.cdr.detectChanges();
  }

  public resetAutoComplete(enabled?: boolean): void {
    this._mapAutoComplete.valueInput && this._mapAutoComplete.inputClear(enabled);
  }

  public resetToolbarDraw(): void { this._drawManager.resetButtons(); }

  private _onRouteChangedListener(): void {
    const route$ = this.storage.routeReady$.pipe(takeUntil(this.destroy$));
    route$.subscribe((route) => {
      this.removeRoutes();
      this.addRoute(route);
    });
  }

  private _routeEventListener(): void {
    const event$ = this._router.events.pipe(takeUntil(this.destroy$))
      .pipe(
        filter((val) => val instanceof NavigationEnd),
      );
    event$.subscribe((event: NavigationEnd) => {
      this.mapService.cleanUp();
      this._service.checkAccessToRoute();
      this._sidenavInit();
      this._onRouterUrl();
      this._setIsHotelSearch(event.urlAfterRedirects);
    });
  }

  private _onRouterUrl(): void {
    switch (true) {
      case this._router.url.indexOf('hotel?isRestore=true') > 0:
        this._drawManager.isShowMarker = false;
        this.mapService.resetMarkerClusterOptions();
        break;
      case this._router.url.indexOf('hotel?restoreById=') > 0:
          this.mapService.resetMarkerClusterOptions();
        break;
    }
  }

  private _redrawArea(event: MapStateOptions): void {
    this._drawManager.setMode(SearchMapBuilder.buildDrawArea(event));
  }

  private _redrawMarker(event: MapStateOptions): void {
    this._drawManager.setMode(SearchMapBuilder.buildDrawMarker(event));
  }

  private _redrawCircle(event: MapStateOptions): void {
    event.drawCircle && this._drawManager.setMode(SearchMapBuilder.buildDrawCircle(event));
  }

  private _redrawRoutes(event): void {
    this.removeRoutes();
    this.addRoute(event.routes);
  }

  private _refreshMarkers(): IMarker[] {
    const copied = [...this.markers];
    this.markers = [];
    this.cdr.detectChanges();
    return copied;
  }

  private _sidenavInit(): void {
    if (this._route.firstChild && this._route.firstChild.snapshot) {
      this.sidenavViewContent = this._route.firstChild.snapshot.data.sidenav;
      this.sidenavContentViewContent = this._route.firstChild.snapshot.data.sidenavContent;
      const arr = [ 'airSearch', 'hotelSearch', 'transferSearch', 'trainSearch' ];
      this.showNavigation = arr.findIndex((e) => e === this.sidenavViewContent) !== -1;
    } else {
      this.sidenavViewContent = 'none';
      this.sidenavContentViewContent = 'map';
    }
    this._sidenavToggle();
    !(<ViewRef>this.cdr).destroyed && this.cdr.detectChanges();
    this.mapService.resetMap(!this._router.url.includes('hotel'));
  }

  private _sidenavToggle(): void {
    (this._sidenav.opened && this.sidenavViewContent === 'none') && this._sidenav.close();
    (!this._sidenav.opened && this.sidenavViewContent !== 'none') && this._sidenav.open();
  }

  private _setIsHotelSearch(url: string): void {
    this.isHotelSearch = url.includes('hotel');
  }

}
