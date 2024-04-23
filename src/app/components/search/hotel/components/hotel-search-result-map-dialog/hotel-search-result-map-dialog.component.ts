import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

// external libs
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { isEqual } from 'lodash';

// internal libs
import { IFileInfo, Utils } from 'h21-be-ui-kit';
import {
  H21MapComponent,
  MapType,
  MarkerIconSvg,
} from 'h21-map';

// interfaces
import { IClusterOptions, IDrawingOptions, IInfoBoxOptions, IMapOptions, IMarker } from '@search/interfaces';
import { ISearchNotification } from '@transfer/interfaces';
import { IHotelSearchResultItem } from '@hotel/interfaces';

// services
import { HotelRoomService, SetSearchService } from '@hotel/services';
import { NotificationSignalRService } from '@core/services';

// models
import { Marker } from '@hotel/models';

// environment
import { environment } from '@environments/environment';

// enums
import { PointType } from '@transfer/enums';

@Component({
  selector: 'h21-hotel-search-result-map-dialog',
  templateUrl: './hotel-search-result-map-dialog.component.html',
  styleUrls: [ './hotel-search-result-map-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelSearchResultMapDialogComponent implements OnInit, OnDestroy {

  @ViewChild('map') public map: H21MapComponent;

  public inProgress = true;
  public noProgress: boolean;
  public isCompleted: boolean;

  public noResultText = 'Nothing found';

  public showProviderImg = true;
  public showInfoBoxProviderImg = true;

  public selectedTabIndex = 0;
  public mapOptions: IMapOptions = this._buildMapOptions();
  public infoBoxOptions: IInfoBoxOptions = this._buildInfoBoxOptions();
  public clusterOptions: IClusterOptions = this._buildClusterOptions();

  public infoBoxImages: Record<number, Observable<string>> = {};

  public markers: IMarker[] = [];
  public dataSource: IHotelSearchResultItem[];

  public isUseFilter: boolean;
  public selectedHotelId = this._panelData.hotelId;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef,
    private _service: HotelRoomService,
    private _domSanitizer: DomSanitizer,
    private _searchService: SetSearchService,
    private _matIconRegistry: MatIconRegistry,
    private _notify: NotificationSignalRService,
    @Inject(MAT_DIALOG_DATA) private _panelData: any,
    private _dialogRef: MatDialogRef<HotelSearchResultMapDialogComponent>,
  ) {
    const resource = this._domSanitizer.bypassSecurityTrustResourceUrl('./assets/h21icons.svg');
    this._matIconRegistry.addSvgIconSet(resource);
  }

  public ngOnInit(): void {
    this._notifyListener();
    this._filterListener();
    this._service.responseAsync(this._service.hotelFilter$.getValue(), 'search$');
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number, item: IHotelSearchResultItem): number {
    return item.id;
  }

  public redirectToCard(item): void {
    this._service.hotelClick$.next(item.id);
  }

  public updFavoriteState(item: IHotelSearchResultItem): void {
    this.inProgress = true;
    item.isFavorite ? this._deleteFavorite(item) : this._addFavorite(item);
  }

  public animateMarker(id: number, isOut: boolean): void {
    const marker = this.markers.find((item) => item.data.id === id);
    if (!marker) { return; }
    marker.isLabelActive = !isOut;
    marker.iconZIndex = isOut ? 100 : 1000;
  }

  public close(): void {
    this._removeMarkers();

    this._destroy$.next(true);
    this._service.needUpdateLists$.next();

    this._dialogRef.close(false);
  }

  public onMapReady(init?: boolean): void {
    if (init) {
      const search$ = this._service.search$
        .pipe(
          filter(Boolean),
          tap((items) => items.forEach((item) => item.showProviderImg = true)),
          takeUntil(this._destroy$),
        );

      search$.subscribe((hotels: IHotelSearchResultItem[]) => {
        this.dataSource = hotels;
        this.inProgress = false;
        this.noProgress = !(hotels && hotels.length);
        this._buildMarkers();
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      });

      this._buildMarkers();
    }
  }

  public markerMouseOver(event, marker: Marker): void {
    marker.isLabelActive = !(this.selectedHotelId === marker.data.id);
    marker.iconZIndex = 1001;
    if (Boolean(marker.data)) {
      this.showInfoBoxProviderImg = true;
      this.infoBoxOptions.clientX = event.clientX;
      this.infoBoxOptions.clientY = event.clientY;
      this.infoBoxOptions.hotel = marker.data;
      this.infoBoxOptions.isShow = true;
    }
  }

  public markerMouseOut(marker: Marker): void {
    marker.isLabelActive = false;
    marker.iconZIndex = 99;
    this.infoBoxOptions.isShow = false;
  }

  private _filterListener(): void {
    const filter$ = this._service.hotelFilter$
      .pipe(
        map((item) => item.filter),
        takeUntil(this._destroy$),
      );
    filter$.subscribe((item) => {
      const { responseId, firstHotelId, batchesIdIn, distanceLessEqual, maxDistanceByCar, ...mapFilter } = item;
      this.isUseFilter = !isEqual(mapFilter, this._service.defHotelFilter);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _addFavorite(item: IHotelSearchResultItem): void {
    const add$ = this._searchService.addFavorite(item.id).pipe(takeUntil(this._destroy$));
    add$.subscribe(() => this._onUpdState(item));
  }

  private _deleteFavorite(item: IHotelSearchResultItem): void {
    const delete$ = this._searchService.deleteFavorite(item.id).pipe(takeUntil(this._destroy$));
    delete$.subscribe(() => this._onUpdState(item));
  }

  private _onUpdState(item: IHotelSearchResultItem): void {
    item.isFavorite = !item.isFavorite;
    this._updFavSign(item);

    this.inProgress = false;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _notifyListener(): void {
    const notify$ = this._notify.searchResult$
      .pipe(
        filter((item) => !!item),
        takeUntil(this._destroy$),
      );
    notify$.subscribe((result: ISearchNotification) => {
      const requestId = sessionStorage.getItem('requestId');
      if (requestId === result.requestId) {
        this.isCompleted = result.isCompleted;
      }
    });
  }

  private _updFavSign(item: IHotelSearchResultItem): void {
    const marker = this.markers.find((val) => val.data.id === item.id);
    marker.data.isFavorite = item.isFavorite;
    this.animateMarker(marker.data.id, true);
  }

  private _loadImg(info: IFileInfo): Observable<string> {
    const url = `${environment.core.fileStorageUrl}DownloadPublicFile?hash=${info.fileHash}&name=photo`;
    return this._http.get(url, { responseType: 'blob' })
      .pipe(
        map((data) => Utils.getUrlFromBlob(info.fileName, data)),
      );
  }

  private _buildMarkers(): void {
    this.dataSource && this._removeMarkers();
    this.dataSource && this.dataSource.forEach((hotel) => {
      if (hotel.image && Object.keys(hotel.image).length) {
        this.infoBoxImages[hotel.id] = this._loadImg(hotel.image);
      }
      this._addMarker(hotel);
    });
    this.markers.length && this._changeClusterOptions();
  }

  private _addMarker(hotel: IHotelSearchResultItem): void {
    const marker = this.selectedHotelId === hotel.id && !hotel.rooms.minTotalCost ?
      this._buildSelectedHotelMarker(hotel) : this._buildMarker(hotel);

    this.markers.push(marker);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    setTimeout(() => { this.map.manager.getMap().fitBounds(); }, 1000);
  }

  private _buildMarker(hotel: IHotelSearchResultItem): IMarker {
    return {
      latitude: hotel.hotelLocation.latitude,
      longitude: hotel.hotelLocation.longitude,
      fitBounds: false,
      isCluster: true,
      labelContent: this._buildLabelContent(hotel),
      labelClass: this._buildLabelClass(hotel),
      iconUrl: `${environment.iconsUri}${hotel.isFavorite ? MarkerIconSvg.favorite : MarkerIconSvg.hotel}`,
      typePoint: hotel.isFavorite ? PointType.favorite : PointType.hotel,
      iconZIndex: 99,
      animate: null,
      data: this._buildHotelData(hotel),
    };
  }

  private _buildSelectedHotelMarker(hotel: IHotelSearchResultItem): IMarker {
    return {
      latitude: hotel.hotelLocation.latitude,
      longitude: hotel.hotelLocation.longitude,
      fitBounds: false,
      iconHeight: 33,
      iconUrl: `${environment.iconsUri}${MarkerIconSvg.hotelLocationSelected}`,
      typePoint: PointType.destination,
      iconZIndex: 99,
      data: this._buildHotelData(hotel),
    };
  }

  private _buildHotelData(hotel: IHotelSearchResultItem): any {
    return {
      id: hotel.id,
      rooms: hotel.rooms,
      hotelRating: hotel.hotelRating,
      hotelName: hotel.hotelName,
      isFavorite: hotel.isFavorite,
      image: {
        fileUrl: hotel.image && hotel.image.fileUrl,
      },
      hotelAddress: hotel.hotelAddress,
    };
  }

  private _buildLabelContent(hotel: IHotelSearchResultItem): string {
    const color = this.selectedHotelId === hotel.id && 'selected-hotel-marker-color';
    return `<div class='h21-map-price-marker-inner ${color}'> ${hotel.rooms.minTotalCost} ${hotel.rooms.currency} </div>`;
  }

  private _buildLabelClass(hotel: IHotelSearchResultItem): string {
    return this.selectedHotelId === hotel.id ? 'h21-map-price-marker selected' : 'h21-map-price-marker';
  }

  private _removeMarkers(): void {
    this.markers = [];
    this.map.manager.getMap().cluster.removeMarkers();
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _buildMapOptions(): IMapOptions {
    return {
      latitude: 55.729823,
      longitude: 37.640596,
      zoom: 3,
      minZoom: 4,
      maxZoom: 22,
      fitBounds: true,
      preloaderIsOpen: false,
      provider: MapType.auto,
      enableDefaultControl: false,
      isClick: true,
      defaultCursor: 'default',
    };
  }

  private _buildInfoBoxOptions(): IInfoBoxOptions {
    return {
      clientX: 0,
      clientY: 0,
      isShow: false,
      hotel: null,
    };
  }

  private _buildClusterOptions(): IClusterOptions {
    return {
      gridSize: 50,
      minimumClusterSize: 3,
      maxZoom: 11,
    };
  }

  private _changeClusterOptions(): void {
    switch (true) {
      case this.markers.length >= 400:
        this._setClusterOptions(18, 40);
        break;
      case this.markers.length >= 300:
        this._setClusterOptions(17, 50);
        break;
      case this.markers.length >= 200:
        this._setClusterOptions(16, 50);
        break;
      case this.markers.length >= 100:
        this._setClusterOptions(14, 50);
        break;
      case this.markers.length >= 50:
        this._setClusterOptions(13, 60);
        break;
      case this.markers.length >= 30:
        this._setClusterOptions(12, 65);
        break;
    }
  }

  private _setClusterOptions(maxZoom: number, gridSize: number): void {
    this.clusterOptions.maxZoom = maxZoom;
    this.clusterOptions.gridSize = gridSize;
  }

}
