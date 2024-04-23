import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';

// environment
import { environment } from '@environments/environment';

// external libs
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { of, Subject } from 'rxjs';

// inner libs
import { DrawingModes, MarkerIconSvg, Point, Position } from 'h21-map';
import { H21DateTime, LoadProgressService } from 'h21-be-ui-kit';

// enums
import { LocationType, PointType, RouteMode } from '../../enums';

// interfaces
import { IMarker } from '../../../interfaces/marker.interface';
import { IRoute } from '../../../interfaces/route.interface';

// models
import { ILocation, Location, TransferFilter } from '../../models';

// services
import { TransferService } from '../../services/transfer.service';
import { HistorySearchService } from '@core/services';

// components
import { TransferSearchFormComponent } from './transfer-search-form.component';

@Injectable()
export class TransferSearchService {

  public cmp: TransferSearchFormComponent;
  public minDate = moment().add(24, 'hour').toDate();

  private _toPoint: Point;
  private _fromPoint: Point;

  private _route: IRoute = {
    fitBounds: false,
    strokeColor: '#FFC700',
    strokeWeight: 3.0,
    routeMode: RouteMode.car,
  };

  private _timePattern: RegExp = new RegExp('^\\d{1,2}:\\d{2}$');
  private _dateFormat = 'DD.MM.YYYY';
  private _timeFormat = 'hh:mm';

  constructor(
    private _router: Router,
    private _fb: FormBuilder,
    private _active: ActivatedRoute,
    private _history: HistorySearchService,
    private _transferService: TransferService,
    private _loadProgressService: LoadProgressService,
  ) {
    this._history.current$.next(null);
  }

  public buildForm(): void {
    this.cmp.form = this._fb.group({
      primaryTraveler: new FormControl(null),
      pickUp: new FormControl(null, Validators.required),
      dropDown: new FormControl(null, Validators.required),
      date: new FormControl(null, Validators.required),
      travelersQuantity: new FormControl(1),
      luggageQuantity: new FormControl(0),
      petQuantity: new FormControl(0),
      isWheelChair: new FormControl(false),
      time: new FormControl('', Validators.compose(
        [
          Validators.required,
          Validators.pattern(this._timePattern),
          this._validateTime(),
        ])),
    });
  }

  public restoreByFilter(): void {
    const history$ = this._history.getTransferHistoryRequest(
      () => this.cmp.routeReady.emit(),
      () => this.cmp.isRestore.emit(true),
    );
    history$ &&
    history$.pipe(takeUntil(this.cmp.destroy$))
      .subscribe({
        next: (history: TransferFilter) => {
          this.cmp.filter = history;
          this._fillForm();

          const route = this.cmp.filter.routes[0];
          this._restoreAutocomplete(this.cmp.pickUps$, LocationType.pickUp, route.fromLocation);
          this._restoreAutocomplete(this.cmp.dropDowns$, LocationType.dropDown, route.toLocation);
        },
      });
  }

  public submit(): void {
    if (this.isFormInvalid()) { return; }
    this.fillFilter();
    this._loadProgressService.show(10);

    this.cmp.isPending = true;

    const search$ = this._transferService.search(this.cmp.filter)
      .pipe(
        tap((info) => sessionStorage.setItem('requestId', info.requestId)),
        takeUntil(this.cmp.destroy$),
      );

    search$.subscribe(() => {
        this.cmp.isPending = false;
        this._loadProgressService.hide(1);
        this._router.navigateByUrl('/search/transfer/result');
      },
     () => {
        this.cmp.isPending = false;
        this._loadProgressService.hide(1);
      },
    );
  }

  public clear(): void {
    this.cmp.form.reset();
    this.cmp.form.patchValue({
      travelersCount: 1,
      luggageQuantity: 0,
      sportLuggageQuantity: 0,
      petQuantity: 0,
      isWheelChair: false,
    });
    this._fromPoint = null;
    this._toPoint = null;
    this.cmp.routeReady.emit();
  }

  public onSelect(prediction: Point, type: LocationType) {
    const searchDetails$ = prediction.googlePlaceId ? this.cmp.map.manager.getMap()
                                                          .search.searchDetails(prediction.googlePlaceId)
                                                          .pipe(takeUntil(this.cmp.destroy$)) : of(prediction);

    searchDetails$.subscribe({ next: (point: Point) => { this.buildMarker(point, type); } });
  }

  public resetTripPoint(point: LocationType): void {
    this.cmp.map.manager.getMap().fitBonds = true;
    this.cmp.form.get(point).reset();
    this.cmp.routeReady.emit();

    if (point === LocationType.pickUp) {
      this._fromPoint = null;
      this.cmp.pickUps$.next([]);
      this.buildMarker(this._toPoint, LocationType.dropDown);
    } else {
      this._toPoint = null;
      this.cmp.dropDowns$.next([]);
      this.buildMarker(this._fromPoint, LocationType.pickUp);
    }
  }

  public swapTripPoint(): void {
    if (!this._fromPoint || !this._toPoint) {
      return;
    }

    this.cmp.routeReady.emit();
    this._toPoint = null;

    this._restoreAutocomplete(this.cmp.pickUps$, LocationType.pickUp, this.cmp.filterRoute.toLocation);
    this._restoreAutocomplete(this.cmp.dropDowns$, LocationType.dropDown, this.cmp.filterRoute.fromLocation);
  }

  public setAutocomplete(source: Subject<Point[]>, control: LocationType): void {
    this.cmp.form.get(control).valueChanges
      .pipe(
        filter((val) => val && val.length >= 3),
        switchMap(() => this.cmp.map.manager.getMap().search.searchAutocomplete(this.cmp.form.get(control).value)),
        takeUntil(this.cmp.destroy$),
      ).subscribe({ next: (points: Point[]) => { source.next(points); } });
  }

  public buildMarker(point: Point, type: LocationType): void {
    if (!point) { return; }
    const marker: IMarker = {
      latitude: point.position.latitude,
      longitude: point.position.longitude,
      fitBounds: true,
      iconUrl: `${environment.iconsUri}${MarkerIconSvg[type]}`,
      typePoint: PointType.transfer,
      iconZIndex: 99,
      point: type,
    };

    this.cmp.pointChange.emit(marker);
    this._setLocation(point, type);
    this._onPointChanged(type, marker);
  }

  public getAddress(position: Position): void {
    this.cmp.currentPoint &&
      this.cmp.map.manager.getMap().geocoding.getAddress(position.latitude, position.longitude)
        .pipe(takeUntil(this.cmp.destroy$))
        .subscribe({
          next: (point: Point) => {
            this.cmp.form.get(this.cmp.currentPoint).setValue(point);
            this.buildMarker(point, this.cmp.currentPoint);
            this.cmp.drawMarker.emit(DrawingModes.reset);
          },
        });
  }

  public fillFilter(): void {
    this.cmp.filter.primaryTraveler = this.cmp.form.get('primaryTraveler').value;
    this.cmp.filter.luggageQuantity = this.cmp.form.get('luggageQuantity').value;
    this.cmp.filter.isWheelChair = this.cmp.form.get('isWheelChair').value;
    this.cmp.filter.petQuantity = this.cmp.form.get('petQuantity').value;
    this.cmp.filter.travelersQuantity = this.cmp.form.get('travelersQuantity').value;
    this.cmp.filterRoute.fromDate = this.getDateWithTime();
    this.cmp.filter.staticUrl = this.cmp.staticUrl;

    this.cmp.filter.routes = [];
    this.cmp.filter.routes.push(this.cmp.filterRoute);
  }

  public getDateWithTime(): H21DateTime {
    const date: Date = this.cmp.form.get('date').value.toDate();

    const time: string = this.cmp.form.get('time').value;
    const parsed = time.split(':');

    const dateTime = new H21DateTime();
    dateTime.year = date.getFullYear();
    dateTime.month = date.getMonth() + 1;
    dateTime.day = date.getDate();
    dateTime.hour = +parsed[0];
    dateTime.minute = +parsed[1];
    dateTime.second = date.getSeconds();
    dateTime.time = time;

    return dateTime;
  }

  public isFormInvalid(): boolean {
    this._markForm();
    this._checkControl('pickUp');
    this._checkControl('dropDown');
    return this.cmp.form.invalid;
  }

  private _checkControl(control: string): void {
    const val = this.cmp.form.get(control).value;
    if (typeof val === 'string' && val !== '') {
      this.cmp.form.get(control).setErrors({ invalid: true });
    }
  }

  private _restoreAutocomplete(source: Subject<Point[]>, control: LocationType, location: ILocation): void {
    this.cmp.map.manager.getMap().geocoding.getAddress(location.latitude, location.longitude)
      .pipe(takeUntil(this.cmp.destroy$))
      .subscribe({
        next: (point: Point) => {
          source.next([point]);
          this.cmp.form.get(control).setValue(point);
          this.buildMarker(point, control);
        },
      });
  }

  private _markForm(): void {
    Object.keys(this.cmp.form.controls).forEach((control) => {
      this.cmp.form.get(control).markAsTouched();
      this.cmp.form.get(control).updateValueAndValidity();
    });
  }

  private _fillForm(): void {
    this.cmp.primaryTraveler = this.cmp.filter.primaryTraveler;
    this.cmp.form.get('primaryTraveler').setValue(this.cmp.filter.primaryTraveler);
    this.cmp.primaryTraveler && this.cmp.form.get('primaryTraveler').disable();

    this.cmp.form.get('date').setValue(this._getDate());
    this.cmp.form.get('pickUp').setValue(this.cmp.filter.routes[0].fromLocation.address);
    this.cmp.form.get('dropDown').setValue(this.cmp.filter.routes[0].toLocation.address);
    this.cmp.form.get('time').setValue(this.cmp.filter.routes[0].fromDate.time.slice(0, 5));
    this.cmp.form.get('travelersQuantity').setValue(this.cmp.filter.travelersQuantity);
    this.cmp.form.get('luggageQuantity').setValue(this.cmp.filter.luggageQuantity);
    this.cmp.form.get('petQuantity').setValue(this.cmp.filter.petQuantity);
    this.cmp.form.get('isWheelChair').setValue(this.cmp.filter.isWheelChair);
  }

  private _getDate(): moment.Moment {
    const dateTime = this.cmp.filter.routes[0].fromDate;
    const date = moment(new Date(dateTime.year, dateTime.month - 1, dateTime.day));
    return date.isAfter(moment()) ? date : null;
  }

  private _onPointChanged(type: LocationType, marker: IMarker): void {
    switch (type) {
      case LocationType.pickUp:
        this._route.startLatitude = marker.latitude;
        this._route.startLongitude = marker.longitude;
        break;
      case LocationType.dropDown:
        this._route.endLatitude = marker.latitude;
        this._route.endLongitude = marker.longitude;
        break;
    }

    if (this._fromPoint && this._toPoint) {
      this.cmp.routeReady.emit(this._route);
      this.cmp.map.isClick = false;
    }
  }

  private _setLocation(point: Point, type: LocationType): void {
    switch (type) {
      case LocationType.pickUp:
        this.cmp.filterRoute.fromLocation = new Location({
          address: point.name,
          latitude: point.position.latitude,
          googlePlaceId: point.googlePlaceId,
          longitude: point.position.longitude,
        });
        this.cmp.from = point.address;
        this._fromPoint = point;
        break;
      case LocationType.dropDown:
        this.cmp.filterRoute.toLocation = new Location({
          address: point.name,
          latitude: point.position.latitude,
          googlePlaceId: point.googlePlaceId,
          longitude: point.position.longitude,
        });
        this.cmp.to = point.address;
        this._toPoint = point;
        break;
    }
  }

  private _validateTime(): ValidatorFn {
    return (control: AbstractControl): (ValidationErrors | null) => {
      if (!this.cmp.form) {
        return null;
      }

      const timeValue = control.value;
      const selectedTime = moment(timeValue, this._timeFormat);
      if (!this._timePattern.test(timeValue) || !selectedTime.isValid()) {
        return { pattern: { value: timeValue } };
      }

      const dateControl = moment(this.cmp.form.get('date').value, this._dateFormat);
      dateControl.add({ hour: selectedTime.hours(), minute: selectedTime.minutes() });
      const minDate = moment(this.minDate);

      if (dateControl.isValid() && minDate.isBefore(dateControl)) {
        return null;
      } else {
        return { invalidTime: { value: timeValue } };
      }
    };
  }

}
