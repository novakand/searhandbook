import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// external libs
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { merge, Subject } from 'rxjs';
import { Options } from 'ng5-slider';

// inner libs
import { IOrder, Query, Utils } from 'h21-be-ui-kit';

// services
import { TransferService } from '../../services/transfer.service';
import { HistorySearchService } from '@core/services';

// enums
import { ComfortType } from '../../enums';

// models
import { Route, TransferFilter, TransferFilterResult } from '../../models';

const defMaxPrice = 1000;
const defPlaceholder = '1000+';

@Component({
  selector: 'h21-transfer-search-result-filter',
  templateUrl: './transfer-search-result-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferSearchResultFilterComponent implements OnDestroy, OnInit {

  public inProgress = true;
  public route: Route;
  public comfort = ComfortType;
  public transferFilter: TransferFilter;
  public height = '44px';
  public options: Options = {
    floor: 0,
    ceil: defMaxPrice,
    enforceRange: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public maxPrice = defMaxPrice;
  public maxPlaceholder = defPlaceholder;

  public query: Query<TransferFilterResult> = this._transferService.transferFilter$.getValue();
  public fakeFilter: Query<TransferFilterResult> = Utils.deepCopy(this._transferService.fakeFilter$.getValue());

  public minChanged$ = new Subject<void>();
  public maxChanged$ = new Subject<void>();

  private _order: IOrder;
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _active: ActivatedRoute,
    private _history: HistorySearchService,
    private _transferService: TransferService,
  ) { }

  public ngOnInit(): void {
    this._onFilterResult();
    this._onInputChange();
    this._initResultListener();
    this._getLastHistory();

    this._filtersListener();
    this._transferService.fakeFilter$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.query = this._transferService.transferFilter$.getValue();
        const updateFilter = Utils.deepCopy(this._transferService.transferFilter$.getValue());
        updateFilter.filter.maxCost = updateFilter.filter.maxCost === 1000 ? null : updateFilter.filter.maxCost;
        updateFilter.filter.minCost = updateFilter.filter.minCost === 0 ? null : updateFilter.filter.minCost;
        this.fakeFilter = updateFilter;
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public isChecked(type: ComfortType): boolean {
    return this.query.filter.comfortableList && this.query.filter.comfortableList.includes(type);
  }

  public onUserChangeEnd(): void {
    this.fakeFilter = { ...this.query };
    this._filterData();
  }

  public onComfortChange(checked: boolean, type: ComfortType): void {
    !this.query.filter.comfortableList && (this.query.filter.comfortableList = []);

    if (checked) {
      this.query.filter.comfortableList.push(type);
    } else {
      this.query.filter.comfortableList =
        this.query.filter.comfortableList.filter((item) => item !== type);

      !this.query.filter.comfortableList.length && (this.query.filter.comfortableList = null);
    }
    this._filterData();
  }

  private _onFilterResult(): void {
    const filterResult$ = this._transferService.filterResult$.asObservable()
      .pipe(takeUntil(this._destroy$));

    filterResult$.subscribe((order: IOrder) => {
      this._order = order;
      this._filterData();
    });
  }

  private _onInputChange(): void {
    const changes$ = merge(this.minChanged$, this.maxChanged$)
      .pipe(
        debounceTime(1000),
        tap(() => this._checkLimits()),
        takeUntil(this._destroy$),
      );

    changes$.subscribe(() => this._filterData());
  }

  private _filterData(): void {
    if (this._isValidFilter()) {
      this.query.filter.requestId = sessionStorage.getItem('requestId');
      const query = new Query<TransferFilterResult>({
        filter: this.query.filter,
        withCount: true,
        order: this._order && [this._order],
      });
      this.query.filter.requestId && this._transferService.result(query);
    }
  }

  private _isValidFilter(): boolean {
    return this.query.filter.maxCost !== '' && this.query.filter.minCost !== '';
  }

  private _checkLimits(): void {
    this.fakeFilter.filter.maxCost > this.maxPrice && (this.fakeFilter.filter.maxCost = null);
    const minCost = +this.fakeFilter.filter.minCost;
    const maxCost = +this.fakeFilter.filter.maxCost;

    if (!minCost || this.maxPrice <= minCost) {
      this.fakeFilter.filter.minCost = null;
    }

    this._checkHighLimit(minCost, maxCost);
    this._updateFilter();
  }

  private _checkHighLimit(priceGreaterEqual: number, priceLessEqual: number): void {
    if (priceGreaterEqual >= priceLessEqual) {
      this.fakeFilter.filter.maxCost = null;
      this.query.filter.maxCost = this.maxPrice;
    }
  }

  private _updateFilter(): void {
    this.query.filter.minCost = this.fakeFilter.filter.minCost;
    if (this.fakeFilter.filter.maxCost) {
      this.query.filter.maxCost = this.fakeFilter.filter.maxCost;
    }
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _initResultListener(): void {
    const result$ = this._transferService.result$
      .pipe(
        filter((data) => !!data),
        takeUntil(this._destroy$),
      );

    result$.subscribe(() => {
      this.inProgress = false;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _getLastHistory(): void {
    const lastHistory$ = this._history.current$
      .pipe(
        filter((data) => !!data),
        takeUntil(this._destroy$),
      );

    lastHistory$.subscribe((history: TransferFilter) => {
      this.transferFilter = history;
      this.route = this.transferFilter.routes[0];
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _filtersListener(): void {
    this._transferService.transferFilter$.pipe(takeUntil(this._destroy$))
      .subscribe((val) => {
        this.query = val;
        this.fakeFilter = Utils.deepCopy(this.query);
      });
  }

  private _resetFakeFilter(): void {
    this.fakeFilter = Utils.deepCopy(this.query);

    this.fakeFilter.filter.minCost = null;
    this.fakeFilter.filter.maxCost = null;
  }

}
