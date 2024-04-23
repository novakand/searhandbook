import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { environment } from '@environments/environment';

// external libs
import { Subject } from 'rxjs';

// internal libs
import {
  H21MapComponent,
  MapType,
  MarkerIconSvg,
  MarkerIconSvgSelected,
} from 'h21-map';

// interfaces
import {
  IClusterOptions,
  IDrawingOptions,
  IInfoBoxOptions,
  IMapOptions,
  IMarker
} from '@search/interfaces';
import { IHotelSearchResultItem } from '@hotel/interfaces';

// models
import { HotelFilter } from '@hotel/models';

// services
import { HotelLocationService } from './hotel-location.service';

// enums
import { PointType } from '@components/search/transfer/enums';

@Component({
  selector: 'h21-hotel-location',
  templateUrl: './hotel-location.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HotelLocationService],
})
export class HotelLocationComponent implements OnDestroy, OnInit {

  @Input() public data: IHotelSearchResultItem;
  @Input() public items: IHotelSearchResultItem[];

  @ViewChild('map') public map: H21MapComponent;

  public markers: IMarker[] = [];

  public mapOptions: IMapOptions;
  public drawingOptions: IDrawingOptions;
  public infoBoxOptions: IInfoBoxOptions;
  public clusterOptions: IClusterOptions;
  public showProviderImg = true;
  public hotelLocationId = null;

  public filter = new HotelFilter({
    amountOfRooms: 1,
    adultsPerRoom: 1,
    children: [],
  });

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _service: HotelLocationService,
    public cdr: ChangeDetectorRef) {
    this._service.cmp = this;
  }

  public ngOnInit(): void {
    this._initMap();
  }

  public ngOnDestroy(): void {
    this.map.manager.getMap().marker && this.map.manager.getMap().marker.removeMarkers();
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public onMapReady(): void {
    if (this.data) {
      this.hotelLocationId = this.data.id;
      this.addMarkers([this._service.buildMarker(this.data)]);
      this.setMapZoom(this.data.hotelLocation.latitude, this.data.hotelLocation.longitude);
      this._service.filterByRadius(this.data);
    }
  }

  public addMarkers(markers: IMarker[]): void {
    this.markers.push(...markers);
    this.cdr.detectChanges();
  }

  public setMapZoom(latitude: number, longitude: number): void {
    this.map.manager.getMap().setCenter(latitude, longitude, 15);
  }

  public onMarkerMouseOver(event, marker: IMarker): void {
    marker.iconUrl = `${environment.iconsUri}${MarkerIconSvgSelected[marker.typePoint]}`;
    marker.typePoint === PointType.hotelLocation ? marker.iconZIndex = 10001 : marker.iconZIndex = 100;
    if (Boolean(marker.data)) {
      this.infoBoxOptions.clientX = event.clientX;
      this.infoBoxOptions.clientY = event.clientY;
      this.infoBoxOptions.hotel = marker.data;
      this.infoBoxOptions.isShow = true;
    }
  }

  public onMarkerMouseOut(marker: IMarker): void {
    marker.iconUrl = `${environment.iconsUri}${MarkerIconSvg[marker.typePoint]}`;
    marker.typePoint === PointType.hotelLocation ? marker.iconZIndex = 1000 : marker.iconZIndex = 99;
    this.infoBoxOptions.isShow = false;
  }

  public trackByFn(index: number): number { return index; }

  private _initMap(): void {
    this.mapOptions = {
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

    this.drawingOptions = {
      circleMaxRadius: 30000,
      circleRadius: 10000,
      circleFitBounds: true,
      drawMode: null,
      markerLatitude: 0,
      markerLongitude: 0,
      markerFitBounds: true,
      isDraw: false,
      areaCoordinates: [],
      areaFitBounds: true,
    };

    this.clusterOptions = {
      gridSize: 150,
      minimumClusterSize: 3,
      maxZoom: 13,
      iconUrl: `${environment.iconsUri}${MarkerIconSvg.markerCluster}`,
    };

    this.infoBoxOptions = {
      clientX: 0,
      clientY: 0,
      isShow: false,
      hotel: null,
    };
  }

}
