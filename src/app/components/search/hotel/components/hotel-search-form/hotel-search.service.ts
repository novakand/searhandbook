import { ChangeDetectorRef, Injectable, OnDestroy, ViewRef } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// external libs
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { iif, Observable, of, Subject } from 'rxjs';
import * as moment from 'moment';
import { isEqual } from 'lodash';

// inner libs
import { ChangesMap, CircleEvent, DrawingModes, PlaceSubType, Point, Position, ProviderName } from 'h21-map';
import { LoadProgressService } from 'h21-be-ui-kit';

// interfaces
import { IPoi } from '@hotel/components/hotel-poi/poi.interface';
import { IDrawingOptions } from '@search/interfaces';

// models
import { HotelFilter } from '@hotel/models';
import { DrawAreaInfo } from '@search/models/draw-area-info.model';

// services
import { HotelGeneralInfoService } from '@hotel/services/hotel-general-info.service';
import { PoiService } from '@hotel/components/hotel-poi/poi.service';
import { HistorySearchService } from '@core/services';
import { HotelRoomService } from '@hotel/services';

// components
import { HotelSearchFormComponent } from './hotel-search-form.component';

// enums
import { DrawType } from '@hotel/enums';

// builder
import { HotelSearchBuilder } from './hotel-search.builder';

@Injectable()
export class HotelSearchService implements OnDestroy {

  public cmp: HotelSearchFormComponent;
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _poiService: PoiService,
    private _cdr: ChangeDetectorRef,
    private _activated: ActivatedRoute,
    public history: HistorySearchService,
    private _roomService: HotelRoomService,
    private _hotelGI: HotelGeneralInfoService,
    private _loadProgressService: LoadProgressService,
  ) {
    this.history.current$.next(null);
    sessionStorage.removeItem('hotelId');
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public restoreForm(): void {
    this._initDestinationByLocation();

    const request$ = this.history.getHotelHistoryRequest(() => this.cmp.isRestore.emit(true));
    request$ &&
      request$.pipe(takeUntil(this._destroy$))
        .subscribe((value) => {
          this._restore(value);
          this._onLoaderAction('hide');
        });
  }

  public addAgeField(value?: number): void {
    (<FormArray>this.cmp.form.get('children')).controls.push(
      this.cmp.fb.group({
        age: new FormControl(value, Validators.required),
      }),
    );
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public removeAgeField(): void {
    const lastIndex = (<FormArray>this.cmp.form.get('children')).length;
    (<FormArray>this.cmp.form.get('children')).removeAt(lastIndex - 0x1);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public submit(hotelFilter: HotelFilter): void {
    this.cmp.pending$.next(true);
    sessionStorage.removeItem('isCompleted');
    this._onLoaderAction('show');

    this._roomService.searchAsync(hotelFilter)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this._loadProgressService.hide(0x1));
  }

  public clear(): void {
    this.cmp.form.reset();
    this.cmp.form.get('children').value.forEach(() => this.removeAgeField());
    this.cmp.clearForm.emit();
  }

  public onSelect(prediction: Point, isDraw: boolean = true) {
    this.cmp.trackMapCluster.emit(ChangesMap.draw);
    const byPlaceId$: Observable<Point> = this.cmp.map.manager.getMap().search.searchDetails(prediction.googlePlaceId);

    iif(() => Boolean(prediction.googlePlaceId), byPlaceId$, of(prediction))
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (point: Point) => {
          this.cmp.form.get('destination').setValue(point);
          prediction.subtype === PlaceSubType.hotel ? this._showHotel(point) : isDraw && this.drawArea(point);
        },
      });
    this._cdr.detectChanges();
  }

  public drawArea(point: Point): void {
    const info = this.cmp.filter.drawInfo;
    let options: IDrawingOptions;
    if (!info || DrawType.circle === info.type) {
      options = HotelSearchBuilder.buildDrawOptionsByRadius(point.position, this.cmp.filter.drawInfo);
    } else {
      options = HotelSearchBuilder.buildDrawOptionsByArea(this.cmp.filter.drawInfo);
    }
    this.cmp.drawingOptionsChange.emit(options);
  }

  public setRadius(position: Position): void {
    this.cmp.drawingOptionsChange.emit(HotelSearchBuilder.buildDrawOptionsByRadius(position, this.cmp.filter.drawInfo));
  }

  public setDestinationAutocomplete(): void {
    const searchAutocomplete$ = this.cmp.form.get('destination').valueChanges
      .pipe(
        filter((val) => typeof val === 'string' && val.length >= 3),
        switchMap((val) => this._hotelGI.getHotelsStream(val)),
        map(([hotels, points]) => hotels.concat(points).slice(0, 5).filter(Boolean)),
        takeUntil(this._destroy$),
      );

    searchAutocomplete$.subscribe((points) => this.cmp.destinations$.next(points));
  }

  public onCircleEvent(circle: CircleEvent): void {
    const point = this.cmp.form.get('destination').value;
    const equal = point && isEqual({ ...point.position }, { ...circle.position });
    (!equal) && this._updDestination(circle);
  }

  public updateDestByCoordinates(latitude: number, longitude: number, isSetRadius: boolean = false): void {
    const address$ = this.cmp.map.manager.getMap().geocoding
      .getAddress(latitude, longitude).pipe(takeUntil(this._destroy$));

    address$.subscribe((point) => {
      this.cmp.form.get('destination').setValue(point);
      this.cmp.destinations$.next([point]);
      isSetRadius && this.setRadius(point.position);
    });
  }

  public resetTripPoint(isEnabled: boolean): void {
    this.cmp.pending$.next(false);
    this._loadProgressService.hide(1);
    this.cmp.map.manager.getMap().fitBonds = true;
    this.cmp.form.get('destination').reset();
    this.cmp.trackMapCluster.emit(ChangesMap.bbox);
    isEnabled && this.cmp.clearForm.emit();
  }

  public filterByRadius(radius: CircleEvent): void {
    this.onCircleEvent(radius);
  }

  public filterByArea(info: DrawAreaInfo): void {
    const { center, position } = info.area;
    this.updateDestByCoordinates(center.latitude, center.longitude);
  }

  public loadProgressMarkerCluster() {
    const loadingProgress$ = this.cmp.map.manager.getMap().markerCluster.loading.pipe(takeUntil(this._destroy$));
    loadingProgress$.subscribe((isLoading: any) => {
      isLoading ? this._loadProgressService.show(1) : this._loadProgressService.hide(1);
    });
  }

  private _showHotel(point: Point): void {
    this._setZoom(point, 18);
    this.cmp.pointChange.emit([HotelSearchBuilder.buildMarker(point)]);
    this.cmp.map.manager.getMap().markerCluster.setModeCircle(new CircleEvent({
      position: point.position,
      radius: 5000,
      zoom: 15,
    }));
  }

  private _onLoaderAction(method: string): void {
    this._loadProgressService[method](0x1);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _initDestinationByLocation(): void {
    let location = this._activated.snapshot.queryParams.location;
    if (location) {
      location = JSON.parse(location);
      this.updateDestByCoordinates(+location.latitude, +location.longitude, true);
    }
  }

  private _updDestination(circle: CircleEvent): void {
    const current: Position = circle.position;
    const address$ = this.cmp.map.manager.getMap().geocoding
      .getAddress(current.latitude, current.longitude).pipe(takeUntil(this._destroy$));

    address$.subscribe((point) => {
      this.cmp.form.get('destination').setValue(point);
      this.cmp.destinations$.next([point]);
    });
  }

  private _restore(value: HotelFilter): void {
    this.cmp.filter = value;
    this.cmp.primaryTraveler = value.primaryTraveler;
    this.cmp.form.get('primaryTraveler').setValue(value.primaryTraveler);
    this.cmp.primaryTraveler && this.cmp.form.get('primaryTraveler').disable();
    this._fillDestination(value);
    this._initCalendar(value);
    this.cmp.filter.children.forEach((child) => this.addAgeField(child));
  }

  private _fillDestination(value: HotelFilter): void {
    this.cmp.form.get('destination').setValue(value.point);

    const { provider, subtype } = value.point;
    const isHotel = (provider === ProviderName.horse) && (subtype !== 'poi');

    isHotel ? this._showHotel(value.point) : this.drawArea(value.point);
  }

  private _initCalendar(value: HotelFilter): void {
    if (moment(value.arrival).isBefore(moment())) { return; }
    this.cmp.calendar.selectedFromDate = moment.utc(value.arrival).toDate();
    this.cmp.calendar.selectedToDate = moment.utc(value.departure).toDate();

    this.cmp.calendar.setFieldsValue();
  }

  private _setZoom(point: Point, zoom: number = 11): void {
    this.cmp.map.manager.getMap().setCenter(point.position.latitude, point.position.longitude, zoom);
  }

}
