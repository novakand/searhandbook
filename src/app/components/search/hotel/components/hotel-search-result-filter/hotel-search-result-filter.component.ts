import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

// external libs
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';
import { merge, Subject } from 'rxjs';
import { Options } from 'ng5-slider';
import * as moment from 'moment';

// inner libs
import { INamedEntity, Query, Utils } from 'h21-be-ui-kit';

// enums
import { CarbonFootprintType, PriceType } from '@hotel/enums';

// models
import { HotelFilter, HotelFilterResult } from '@hotel/models';

// services
import { HistorySearchService, StorageService } from '@core/services';
import { HotelSearchFilterService } from './hotel-search-filter.service';
import { HotelRoomService } from '@hotel/services';

const defMaxPrice = 1000;
const defMaxDistance = 7.25;
const defPlaceholder = '1000+';

@Component({
  selector: 'h21-hotel-search-result-filter',
  templateUrl: './hotel-search-result-filter.component.html',
  styleUrls: ['./hotel-search-result-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HotelSearchFilterService],
})
export class HotelSearchResultFilterComponent implements OnInit, OnDestroy {

  @Input() public showActions = true;
  @Input() public hideControls: boolean;

  public formFieldAppearance = 'outline';
  public hotelNameCtrl: FormControl = new FormControl();

  public priceTypes = PriceType;
  public carbonTypes = CarbonFootprintType;

  public query: Query<HotelFilterResult> = this._service.hotelFilter$.getValue();
  public history$ = this._history.current$.pipe(filter(Boolean));
  public fakeFilter$: Query<HotelFilterResult> = Utils.deepCopy(this._service.fakeFilter$.getValue());

  public bookingRatings = [0, 5, 6, 7, 8, 9];
  public suppliers$ = this._filter.findSuppliers();
  public facilities$ = this._filter.findFacilities();
  public isFootprintVisible$ = this._storage.uiSettings$
    .pipe(
      filter(Boolean),
      map((uiSettings) => uiSettings.carbonFootprint),
    );

  public distanceLessControl: FormControl = new FormControl();

  public height = '44px';

  public sliderOptions: Options = {
    floor: 0,
    ceil: defMaxPrice,
    enforceRange: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };
  public sliderDistance: Options = {
    floor: 0,
    ceil: defMaxDistance,
    enforceRange: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
    step: 0.01,
  };

  public maxPrice = defMaxPrice;
  public maxPlaceholder = defPlaceholder;

  public minChanged$ = new Subject<void>();
  public maxChanged$ = new Subject<void>();

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _service: HotelRoomService,
    private _history: HistorySearchService,
    private _filter: HotelSearchFilterService,
  ) {
    const less = this.fakeFilter$.filter.priceLessEqual;
    const greater = this.fakeFilter$.filter.priceGreaterEqual;

    this.fakeFilter$.filter.priceLessEqual = less === 1000 ? null : less;
    this.fakeFilter$.filter.priceGreaterEqual = greater === 0 ? null : greater;

    this._onInputChange();
  }

  public ngOnInit(): void {
    this._listeners();
  }

  public ngOnDestroy(): void {
    this.showActions && this._service.resetFilter();

    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public onPriceCalcChange(type: PriceType, filterHotel?: HotelFilter): void {
    this._resetFakeFilter();

    const nights = filterHotel && this._calcNightsCount(filterHotel);
    this.maxPrice = filterHotel ? nights * defMaxPrice : defMaxPrice;
    this.maxPlaceholder = filterHotel ? `${nights * defMaxPrice}` : defPlaceholder;

    this.query.filter.priceCalculation = type;
    this.query.filter.priceLessEqual = this.maxPrice;
    this.query.filter.priceGreaterEqual = null;

    this.sliderOptions = { ...this.sliderOptions, ...{ ceil: this.maxPrice } };
  }

  public onSearchByHotelNameChange(letters: string): void {
    if (letters.length < 2) {
      return;
    }

    this.query.filter.hotelNameLetters = letters;
    this.filterHotels();
  }

  public onRefundableChange(isRefundable: boolean): void {
    this.query.filter.isRefundable = isRefundable || null;
    this.filterHotels();
  }

  public onBreakfastIncludedChange(isBreakfastIncluded: boolean): void {
    this.query.filter.isBreakfastIncluded = isBreakfastIncluded || null;
    this.filterHotels();
  }

  public isAllFacilitiesSelected(facilities: INamedEntity[]): boolean {
    return facilities.length === this.query.filter.facilities.length;
  }

  public selectAllFacilities(facilities: INamedEntity[]): void {
    this.query.filter.facilities = [];
    this.query.filter.facilities = facilities.map((item) => item.name);
    this.filterHotels();
  }

  public resetAllFacilities(): void {
    this.query.filter.facilities = [];
    this.filterHotels();
  }

  public isAllSuppliersSelected(suppliers: INamedEntity[]): boolean {
    return suppliers.length === this.query.filter.suppliers.length;
  }

  public selectAllSuppliers(suppliers: INamedEntity[]): void {
    this.query.filter.suppliers = [];
    this.query.filter.suppliers = suppliers.map((item) => item.name);
    this.filterHotels();
  }

  public resetAllSuppliers(): void {
    this.query.filter.suppliers = [];
    this.filterHotels();
  }

  public isChecked<T>(collection: T[], item: T): boolean {
    return collection && collection.includes(item);
  }

  public onChange<T>(colName: string, collection: T[], checked: boolean, value: T): void {
    checked ?
      collection.push(value) :
      (this.query.filter[colName] = collection.filter((item) => item !== value));

    this.filterHotels();
  }

  public onUserChange(): void {
    const copyQuery = Utils.deepCopy(this.query);
    copyQuery.filter.distanceLessEqual = +copyQuery.filter.distanceLessEqual;
    this._service.fakeFilter$.next(copyQuery);
  }

  public onUserChangeEnd(): void {
    const update = this.query.filter.priceLessEqual < this.maxPrice;
    !update && (this.fakeFilter$.filter.priceLessEqual = null);
    this.fakeFilter$.filter.priceGreaterEqual = this.query.filter.priceGreaterEqual || null;
    this.filterHotels(update);
  }

  public filterHotels(needUpdate?: boolean): void {
    needUpdate && this._updateFakeFilter();

    const copyQuery = Utils.deepCopy(this.query);
    this._updateFilterByBatchIdList(copyQuery);

    this.distanceLessControl.setValue(this.query.filter.distanceLessEqual);
    copyQuery.filter.distanceLessEqual = +copyQuery.filter.distanceLessEqual;
    this._service.hotelFilter$.next(copyQuery);
    this._service.fakeFilter$.next(copyQuery);
  }

  public changeBookingRating(rating: number, checked: boolean): void {
    if (checked) {
      this.query.filter.minBookingRating = rating;
    } else {
      this.query.filter.minBookingRating = rating && rating < 9 ? rating + 1 : null;
    }
    this.filterHotels();
  }

  private _listeners(): void {
    this._updateListener();
    this._filtersListener();
    this._distanceListener();
    this._fakeFilterListener();
    this._distanceLessListener();
  }

  private _fakeFilterListener(): void {
    const changed$ = this._service.fakeFilter$.pipe(takeUntil(this._destroy$));
    changed$.subscribe((data) => {
      const updateFilter = Utils.deepCopy(data);

      updateFilter.filter.priceLessEqual = data.filter.priceLessEqual === 1000 ? null : data.filter.priceLessEqual;
      updateFilter.filter.priceGreaterEqual = data.filter.priceGreaterEqual === 0 ? null : data.filter.priceGreaterEqual;

      this.query = this._service.hotelFilter$.getValue();
      this.fakeFilter$ = updateFilter;
      updateFilter.filter.distanceLessEqual && this.distanceLessControl.setValue(updateFilter.filter.distanceLessEqual);

      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _distanceLessListener(): void {
    const changed$ = this.distanceLessControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map((distance) => distance),
        map((distance) => {
          const maxRange = this._service.distance$.value;
          return +distance > maxRange ? String(maxRange) : distance;
        }),
        takeUntil(this._destroy$),
      );
    changed$.subscribe((distance) => {
      this.query.filter.distanceLessEqual = distance;
      this.filterHotels();
    });
  }

  private _distanceListener(): void {
    const distance$ = this._service.distance$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      );

    distance$.subscribe((distance) => {
      this.query.filter.distanceLessEqual = distance;
      this.query.filter.maxDistanceByCar = distance;
      this.distanceLessControl.setValue(distance);

      this.sliderDistance.ceil = distance;
      this.sliderDistance = { ...this.sliderDistance };

      this._cdr.detectChanges();
    });
  }

  private _updateFilterByBatchIdList(query: Query<HotelFilterResult>) {
    const hotelsInBatches = this._storage.hotelsInBatchData$.getValue();
    hotelsInBatches.forEach((x) => x.isShown = true);
    this._storage.hotelsInBatchData$.next(hotelsInBatches);
    query.filter.batchesIdIn = hotelsInBatches.map((x) => x.batchId);
  }

  private _updateListener(): void {
    const needUpdateLists$ = this._service.needUpdateLists$.pipe(takeUntil(this._destroy$));
    needUpdateLists$.subscribe(() => this.filterHotels());
  }

  private _filtersListener(): void {
    const hotelFilter$ = this._service.hotelFilter$.pipe(takeUntil(this._destroy$));
    hotelFilter$.subscribe((val) => this.query = val);
  }

  private _resetFakeFilter(): void {
    this.fakeFilter$ = Utils.deepCopy(this.query);

    this.fakeFilter$.filter.priceLessEqual = null;
    this.fakeFilter$.filter.priceGreaterEqual = null;
  }

  private _updateFakeFilter(): void {
    this.fakeFilter$.filter.priceGreaterEqual = this.query.filter.priceGreaterEqual;
    this.fakeFilter$.filter.priceLessEqual = this.query.filter.priceLessEqual;
  }

  private _calcNightsCount(hotelFilter: HotelFilter): number {
    const arrival = moment(hotelFilter.arrival);
    const departure = moment(hotelFilter.departure);

    return departure.diff(arrival, 'days');
  }

  private _onInputChange(): void {
    merge(this.minChanged$, this.maxChanged$)
      .pipe(
        debounceTime(1000),
        tap(() => {
          this._checkLimits();
          this.fakeFilter$.filter.priceLessEqual > this.maxPrice && (this.fakeFilter$.filter.priceLessEqual = null);
        }),
        takeUntil(this._destroy$),
      ).subscribe(() => this.filterHotels());
  }

  private _updateFilter(): void {
    this.query.filter.priceGreaterEqual = this.fakeFilter$.filter.priceGreaterEqual;
    this.fakeFilter$.filter.priceLessEqual && (this.query.filter.priceLessEqual = this.fakeFilter$.filter.priceLessEqual);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _checkLimits(): void {
    const priceGreaterEqual = +this.fakeFilter$.filter.priceGreaterEqual;
    const priceLessEqual = +this.fakeFilter$.filter.priceLessEqual;

    if (!priceGreaterEqual || this.maxPrice <= priceGreaterEqual) {
      this.fakeFilter$.filter.priceGreaterEqual = null;
    }

    this._checkHighLimit(priceGreaterEqual, priceLessEqual);
    this._updateFilter();
  }

  private _checkHighLimit(priceGreaterEqual: number, priceLessEqual: number): void {
    if (priceGreaterEqual >= priceLessEqual) {
      this.fakeFilter$.filter.priceLessEqual = null;
      this.query.filter.priceLessEqual = this.maxPrice;
    }
  }

}
