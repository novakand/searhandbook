import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewRef
} from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';

// external libs
import { BehaviorSubject, combineLatest, iif, Observable, of, range, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';
import * as moment from 'moment';

// inner libs
import { ActionInfo, ActionType, H21TwoMonthCalendarComponent, LoadProgressService, Query, Utils } from 'h21-be-ui-kit';
import { MapManager, PlaceIconsType, Point, ProviderName } from 'h21-map';

// models
import { HotelFilter, HotelGeneralInfoFilter } from '@components/search/hotel/models';
import { DrawAreaInfo } from '@search/models/draw-area-info.model';

// interfaces
import { ISearchRequestInfo } from '@components/search/interfaces';

// services
import { HotelGeneralInfoService, HotelRoomService } from '@components/search/hotel/services';
import { HistorySearchService, StorageService } from '@core/services';

// enums
import { DrawType } from '@hotel/enums';

@Component({
  selector: 'h21-hotel-search-toolbar',
  templateUrl: './hotel-search-toolbar.component.html',
  styleUrls: [ './hotel-search-toolbar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ HotelGeneralInfoService ],
})
export class HotelSearchToolbarComponent implements OnInit, OnDestroy {

  @ViewChild('calendar') public calendar: H21TwoMonthCalendarComponent;
  @ViewChild('roomsMenuBtn') set roomsMenuTrigger(trigger: MatMenuTrigger) {
    if (trigger && !this._roomsMenuTrigger) {
      this._roomsMenuTrigger = trigger;
      this._setRoomsListener();
    }
  }

  public form: FormGroup;
  public formFieldAppearance = 'outline';
  public ages$ = range(0, 17).pipe(toArray());

  public hideRoomsInfo: boolean;
  public hasError: boolean;
  public isPending: boolean;

  public disabled: boolean;
  public iconType = PlaceIconsType;

  public destinationCtrl = new FormControl();
  public destinations$ = new BehaviorSubject(null);

  public filter$ = this._history.current$
    .pipe(
      filter(Boolean),
      tap((filterObj: HotelFilter) => {
        this._setDates(filterObj);
        this._restoreForm(filterObj);
        this._setDestination(filterObj);
      }),
    );

  public arrival: Date;
  public departure: Date;

  private _roomsMenuTrigger : MatMenuTrigger;
  private _isHotelCard = this._router.url.includes('search/hotel/card');

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _history: HistorySearchService,
    private _roomService: HotelRoomService,
    private _hotelGI: HotelGeneralInfoService,
    @Inject('window') private _window: Window,
    private _breakpointObserver: BreakpointObserver,
    private _loadProgressService: LoadProgressService,
  ) {
    this._buildForm();
    this._setDestinationAutocomplete();
  }

  public ngOnInit(): void {
    this._brakePointListener();
    !this._isHotelCard && this._onHotelClick();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public update(filterObj: HotelFilter): void {
    this.isPending = true;
    const data = Utils.deepCopy(filterObj);

    data.children = this.form.get('children').value && this.form.get('children').value.map((item) => item.age);
    this._correctDates(data);

    this._loadProgressService.show(1);
    const room$ = this._roomService.searchUpdateAsync(data)
      .pipe(
        tap((info) => this._storeAndOpen(info)),
        takeUntil(this._destroy$),
      );
    room$.subscribe(() => {
      this._history.refresh$.next(true);
      this._stop();
    });
  }

  public changeChildrenCount($event: ActionInfo, filterObj: HotelFilter): void {
    if (ActionType.increase === $event.type) {
      this._addAgeField();
      filterObj.children.push(null);
    } else {
      this._removeAgeField();
      filterObj.children.splice(filterObj.children.length - 0x1, 0x1);
    }
  }

  public onDateChange(dateName: string, date: Date, filterObj: HotelFilter): void {
    const utc = Utils.getUTCDate(date);
    filterObj[dateName] = utc;
    this[dateName] = utc;
    this._updDisabledState(filterObj);
  }

  public selectDestination(point: Point, filterObj: HotelFilter): void {
    filterObj.destination = point.name;
    filterObj.googlePlaceId = point.googlePlaceId;
    this._setHotelId(point, filterObj);
    this._onSelect(point, filterObj);
  }

  public getRoomsTooltipText(filterObj: HotelFilter): string {
    return `Amount of rooms: ${filterObj.amountOfRooms}\nAdults per room: ${filterObj.adultsPerRoom}`;
  }

  private _onHotelClick(): void {
    let hotelId: number;
    const hotelClick$ = this._roomService.hotelClick$
    .pipe(
      tap((id) => hotelId = id),
      switchMap(() => this._history.saveHotelSearch(<HotelFilter>this._history.current$.value)),
      takeUntil(this._destroy$),
    );
    hotelClick$.subscribe((id) => {
      const hotels = this._roomService.search$.getValue();
      const hotel = hotels ? hotels.find((item) => item.id === hotelId) : null;
      const roomsBatchId = hotel ? hotel.roomsBatchId : '';
      this._window.open(`${window.location.origin}/search/hotel/card?id=${hotelId}&historyId=${id}&roomsBatchId=${roomsBatchId}`);
    });
  }

  private _brakePointListener(): void {
    const onWidthChanged$ = this._breakpointObserver.observe(['(max-width: 1300px)']).pipe(takeUntil(this._destroy$));
    onWidthChanged$.subscribe((state: BreakpointState) => {
      this.hideRoomsInfo = state.matches;
      this._cdr.markForCheck();
    });
  }

  private _stop(): void {
    this._loadProgressService.hide(1);
    this.isPending = false;
    this._cdr.detectChanges();
  }

  private _storeAndOpen(info: ISearchRequestInfo): void {
    sessionStorage.setItem('requestId', info.requestId);
    this._isHotelCard && this._window.open(`${window.location.origin}/search/hotel/result?requestId=${info.requestId}`);
  }

  private _setHotelId(point: Point, filterObj: HotelFilter): void {
    if (this._isHotel(point)) {
      filterObj.hotelId = +point.id;
      sessionStorage.setItem('hotelId', point.id);
    } else {
      filterObj.hotelId = null;
      sessionStorage.removeItem('hotelId');
    }
  }

  private _isHotel(point: Point): boolean {
    const { provider, subtype } = point;
    return (provider === ProviderName.horse) && (subtype !== 'poi');
  }

  private _setDestination(filterObj: HotelFilter): void {
    filterObj.point && this.destinationCtrl.setValue(filterObj.point.name);
    this._updDisabledState(filterObj);
  }

  private _onSelect(prediction: Point, filterObj: HotelFilter): void {
    const byPlaceId$: Observable<Point> = this._storage.manager$.getValue().getMap().search.searchDetails(prediction.googlePlaceId);

    iif(() => Boolean(prediction.googlePlaceId), byPlaceId$, of(prediction))
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (item: Point) => {
          filterObj.point = item;
          filterObj.drawInfo && this._updPositionInDrawInfo(filterObj.drawInfo, item);
          this.destinationCtrl.setValue(filterObj.point.name);
          this._updDisabledState(filterObj);
        },
      });
  }

  private _updPositionInDrawInfo(info: DrawAreaInfo, point: Point): void {
    const type = info.type === DrawType.circle ? 'circle' : 'area';
    info[type].position = point.position;
  }

  private _setRoomsListener(): void {
    this._roomsMenuTrigger.menuOpened.subscribe(() => {
      (<FormArray>this.form.get('children')).controls.forEach((el: FormGroup) => {
        el.get('age').updateValueAndValidity();
        el.get('age').markAsTouched();
      });
    });

    this._roomsMenuTrigger.menuClosed.subscribe(() => {
      this.form.get('children').updateValueAndValidity();
      this.form.get('children').markAsTouched();
      this.hasError = this.form.invalid;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _setDates({ arrival, departure }): void {
    arrival && (this.arrival = moment.utc(arrival).toDate());
    departure && (this.departure = moment.utc(departure).toDate());
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      children: this._fb.array([]),
    });
  }

  private _setDestinationAutocomplete(): void {
    this._managerListener().subscribe(() => {
      const searchAutocomplete$ = this.destinationCtrl.valueChanges
      .pipe(
        filter((val) => typeof val === 'string' && val.length >= 3),
        switchMap((val) => this._getHotelsStream(val)),
        map(([hotels, points]) => hotels.concat(points).slice(0, 5).filter(Boolean)),
        takeUntil(this._destroy$),
      );

      searchAutocomplete$.subscribe((points: Point[]) => this.destinations$.next(points));
    });
  }

  private _getHotelsStream(val: string): Observable<[Point[], Point[]]> {
    const callbackFn = (item) => item.subtype !== PlaceIconsType.hotel;
    const autocomplete$ = this._hotelGI.autocomplete(new Query<HotelGeneralInfoFilter>({
      filter: new HotelGeneralInfoFilter({
        nameOrAddressContains: val,
      }),
      take: 3,
    }));
    const search$ = this._storage.manager$.value.getMap().search.searchAutocomplete(val)
    .pipe(
      map((points) => points && points.filter(callbackFn)),
    );

    return combineLatest(autocomplete$, search$);
  }

  private _managerListener(): Observable<MapManager> {
    return this._storage.manager$.pipe(
      filter((value) => !!value),
      takeUntil(this._destroy$),
    );
  }

  private _restoreForm(filterObj: HotelFilter): void {
    if (filterObj.children && filterObj.children.length > 0) {
      filterObj.children.forEach((e) => this._addAgeField(e));
    }
  }

  private _addAgeField(value?: number): void {
    (<FormArray>this.form.get('children')).controls.push(
      this._fb.group({
          age: new FormControl(value, Validators.required),
        },
      ),
    );
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _removeAgeField(): void {
    const lastIndex = (<FormArray>this.form.get('children')).length;
    (<FormArray>this.form.get('children')).removeAt(lastIndex - 0x1);
    this._cdr.detectChanges();
  }

  private _correctDates(data: HotelFilter): void {
    data.arrival = moment(this.arrival).format('YYYY-MM-DD[T]hh:mm:ss.SSS[Z]');
    data.departure = moment(this.departure).format('YYYY-MM-DD[T]hh:mm:ss.SSS[Z]');
  }

  private _updDisabledState(filterObj: HotelFilter): void {
    this.disabled = !filterObj.point || !filterObj.arrival;
  }

}
