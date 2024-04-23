import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewRef
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material';

// external libs
import { filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, iif, Observable, of, Subject } from 'rxjs';
import * as moment from 'moment';

// inner libs
import { H21DateTime, H21TwoMonthCalendarComponent, LoadProgressService, Utils } from 'h21-be-ui-kit';
import { PlaceIconsType, Point } from 'h21-map';

// models
import { ILocation, Location, TransferFilter } from '@components/search/transfer/models';

// services
import { TransferService } from '@components/search/transfer/services';
import { HistorySearchService, StorageService } from '@core/services';

// enums
import { LocationType, RouteMode } from '@components/search/transfer/enums';

// interfaces
import { IRoute, ISearchRequestInfo } from '@components/search/interfaces';

@Component({
  selector: 'h21-transfer-search-toolbar',
  templateUrl: './transfer-search-toolbar.component.html',
  styleUrls: [ './transfer-search-toolbar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferSearchToolbarComponent implements OnDestroy, OnInit {

  @ViewChild('calendar') public calendar: H21TwoMonthCalendarComponent;
  @ViewChild('travelersMenuBtn') set travelersMenuTrigger(trigger: MatMenuTrigger) {
    if (trigger && !this._travelersMenuTrigger) {
      this._travelersMenuTrigger = trigger;
    }
  }

  public formFieldAppearance = 'outline';

  public hasError: boolean;
  public isPending: boolean;

  public iconType = PlaceIconsType;
  public locationType = LocationType;

  public toLocationCtrl = new FormControl();
  public fromLocationCtrl = new FormControl();

  public toLocations$ = new BehaviorSubject<Point[]>(null);
  public fromLocations$ = new BehaviorSubject<Point[]>(null);

  public localTimeCtrl = new FormControl();
  public timeDictionary: string[];
  public filteredTimeDictionary$: Observable<string[]>;

  public filter$ = this._history.current$
    .pipe(
      filter(Boolean),
      tap((filterObj: TransferFilter) => {
        this._correctDate(filterObj);
        this._setPoint(filterObj.routes[0].toLocation, 'toLocationCtrl', 'toLocations$');
        this._setPoint(filterObj.routes[0].fromLocation, 'fromLocationCtrl', 'fromLocations$');
      }),
    );

  public transferDate: Date;

  private _route: IRoute = {
    fitBounds: false,
    strokeColor: '#FFC700',
    strokeWeight: 3.0,
    routeMode: RouteMode.car,
  };

  private _staticUrl: string;
  private _travelersMenuTrigger : MatMenuTrigger;
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _service: TransferService,
    private _history: HistorySearchService,
    private _loadProgressService: LoadProgressService,
  ) {
    this._setAutocomplete(this.toLocationCtrl, 'toLocations$');
    this._setAutocomplete(this.fromLocationCtrl, 'fromLocations$');
  }

  public ngOnInit() {
    this._setTimeDictionary();

    this._filterTimeList();
    this._correctTimeList();
    this._staticUrlListener();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public update(filterObj: TransferFilter): void {
    this.isPending = true;
    this._loadProgressService.show(1);

    filterObj.staticUrl = this._staticUrl;
    const search$ = this._service.search(filterObj).pipe(takeUntil(this._destroy$));

    search$.subscribe((info: ISearchRequestInfo) => {
        this.isPending = false;
        sessionStorage.setItem('requestId', info.requestId);
      },
    );
  }

  public onDateChange(date: Date, filterObj: TransferFilter): void {
    const dateTime = new H21DateTime();
    dateTime.year = date.getFullYear();
    dateTime.month = date.getMonth() + 1;
    dateTime.day = date.getDate();

    const current = filterObj.routes[0].fromDate;
    filterObj.routes[0].fromDate = { ...current, ...dateTime };
    this.transferDate = date;
  }

  public onSelect(filterObj: TransferFilter, point: Point, type: LocationType, control: string) {
    const byPlaceId$: Observable<Point> = this._storage.manager$.getValue().getMap().search.searchDetails(point.googlePlaceId);

    iif(() => Boolean(point.googlePlaceId), byPlaceId$, of(point))
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (item: Point) => {
          this._onSelectPoint(filterObj, item, type, control);
          this._onPointChanged(filterObj);
          !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
        },
      });
  }

  public selectTime(time: string, filterObj: TransferFilter): void {
    const parsed = time.split(':');

    filterObj.routes[0].fromDate.hour = +parsed[0];
    filterObj.routes[0].fromDate.minute = +parsed[1];
    filterObj.routes[0].fromDate.time = time;

    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public swapTripPoints(filterObj: TransferFilter): void {
    const from = { ...filterObj.routes[0].fromLocation };
    const to = { ...filterObj.routes[0].toLocation };

    filterObj.routes[0].fromLocation = to;
    filterObj.routes[0].toLocation = from;

    this.fromLocationCtrl.setValue(to.address);
    this.toLocationCtrl.setValue(from.address);
  }

  private _staticUrlListener(): void {
    const staticUrl$ = this._storage.staticUrl$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      );
    staticUrl$.subscribe((url) => {
      this.isPending = false;
      this._cdr.detectChanges();
      this._staticUrl = url;
    });
  }

  private _onPointChanged(filterObj: TransferFilter): void {
    this.isPending = true;
    const { fromLocation, toLocation } = filterObj.routes[0x0];
    this._route.startLatitude = fromLocation.latitude;
    this._route.startLongitude = fromLocation.longitude;
    this._route.endLatitude = toLocation.latitude;
    this._route.endLongitude = toLocation.longitude;

    this._storage.routeReady$.next(this._route);
  }

  private _setPoint(location: ILocation, control: string, values: string): void {
    if (!this._storage.manager$.getValue()) { return; }

    const search$ = this._storage.manager$.getValue().getMap().search.searchAutocomplete(location.address)
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      );

    const subs$ = search$.subscribe((points: Point[]) => {
      this[control].setValue(points[0].name);
      this[values].next(points);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      subs$.unsubscribe();
    });
  }

  private _correctDate(filterObj: TransferFilter): void {
    const dateTime = filterObj.routes[0].fromDate;
    filterObj.routes[0].fromDate.time = filterObj.routes[0].fromDate.time.slice(0, 5);
    this.transferDate = Utils.getUTCDate(new Date(Date.UTC(dateTime.year, dateTime.month - 1, dateTime.day)));
  }

  private _setAutocomplete(control: FormControl, property: string): void {
    const searchAutocomplete$ = control.valueChanges
    .pipe(
      filter((val) => typeof val === 'string' && val.length >= 3),
      switchMap((val) => this._storage.manager$.getValue().getMap().search.searchAutocomplete(val)),
      takeUntil(this._destroy$),
    );

    searchAutocomplete$.subscribe((points: Point[]) => this[property].next(points));
  }

  private _setTimeDictionary(chosen?: moment.Moment): void {
    const now = moment();
    const isUse = this._isUseDef(chosen, now);

    const dictionary = [];
    let minutes = this._getStartMinutes(now.minutes());
    for (let i = isUse ? now.hour() : 0x0; i < 0x18; i++) {
      for (let j = isUse ? minutes : 0x0; j < 0x6; j++) {
        dictionary.push(`${this._padLeft(i)}:${j}0`);
      }
      minutes !== 0x0 && (minutes = 0x0);
    }
    this.timeDictionary = dictionary;
  }

  private _filterTimeList(): void {
    this.filteredTimeDictionary$ = this.localTimeCtrl.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._timeDictionaryFilter(value)),
        takeUntil(this._destroy$),
      );
  }

  private _correctTimeList(): void {
    this.localTimeCtrl.valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe((value) => {
        this._setTimeDictionary(value);
        this.filteredTimeDictionary$ = of(this.timeDictionary);
      });
  }

  private _timeDictionaryFilter(value: string): string[] {
    return this.timeDictionary.filter((time) => time.includes(value));
  }

  private _padLeft(n: number, size: number = 2): string {
    let result = n.toString();
    if (result.length < size) {
      result = `0${result}`;
    }
    return result;
  }

  private _isUseDef(chosen: moment.Moment, now: moment.Moment): boolean {
    if (chosen) {
      return chosen.diff(now, 'hours') < 0x18;
    }
    return false;
  }

  private _getStartMinutes(n: number): number {
    const result = n.toString();
    if (result.length === 0x2) {
      return +result.charAt(0x0) + 0x1;
    }
    return (+result >= 0x5 ? 0x0 : +result) + 0x1;
  }

  private _onSelectPoint(filterObj: TransferFilter, point: Point, type: LocationType, control: string): void {
    const route = filterObj.routes[0x0];
    switch (type) {
      case LocationType.pickUp:
        route.fromLocation = new Location({
          address: point.name,
          latitude: point.position.latitude,
          googlePlaceId: point.googlePlaceId,
          longitude: point.position.longitude,
        });
        this[control].setValue(point.name);
        break;
      case LocationType.dropDown:
        route.toLocation = new Location({
          address: point.name,
          latitude: point.position.latitude,
          googlePlaceId: point.googlePlaceId,
          longitude: point.position.longitude,
        });
        this[control].setValue(point.name);
        break;
    }
  }

}
