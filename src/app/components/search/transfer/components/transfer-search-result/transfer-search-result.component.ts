import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// external libs
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { IOrder, IQueryResult, LoadProgressService, Query } from 'h21-be-ui-kit';

// models
import { ILocation, Transfer, TransferFilter, TransferFilterResult, Vehicle } from '../../models';

// services
import { HistorySearchService, NotificationSignalRService } from '@core/services';
import { TransferService } from '../../services/transfer.service';

class SortField {

  public field: string;
  public desc: boolean;
  public name: string;

  constructor(field: string, desc: boolean, name: string) {
    this.field = field;
    this.desc = desc;
    this.name = name;
  }

}

const sortableFields = [
  new SortField('cost', false, 'Price'),
  new SortField('cost', true, 'Price'),
  new SortField('comfortable', false, 'Vehicle class'),
  new SortField('comfortable', true, 'Vehicle class'),
];

@Component({
  selector: 'h21-transfer-search-result',
  templateUrl: './transfer-search-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferSearchResultComponent implements OnInit, OnDestroy {

  public dataSource$ = new Subject<Vehicle[]>();
  public formFieldAppearance = 'outline';

  public filter: TransferFilter;
  public location: ILocation;

  public loaded: number;
  public totalCount = 0;
  public isPending: boolean;

  public sortByList = sortableFields;
  public currentSortField = this.sortByList[0];

  public inProgress = true;
  public noProgress = false;

  private _currentSort: IOrder;
  private _transfers: Transfer[];

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _history: HistorySearchService,
    private _transferService: TransferService,
    private _notify: NotificationSignalRService,
    private _loadProgressService: LoadProgressService,
  ) {
    this._loadProgressService.show(1);
    this._onLoadComponent();
  }

  public ngOnInit(): void {
    this._fillFromHistory();
    this._onSearchResult();

    this._onResultReady();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();

    sessionStorage.removeItem('loaded');
  }

  public trackByFn(index: number): number {
    return index;
  }

  public onSortChange(sortField: SortField): void {
    this.currentSortField = sortField;
    this._currentSort = {
      field: sortField.field,
      desc: sortField.desc,
    };
    this.isPending = true;
    this._transferService.filterResult$.next(this._currentSort);
  }

  private _onLoadComponent(): void {
    sessionStorage.getItem('loaded') && this._load();
    sessionStorage.setItem('loaded', 'loaded');
  }

  private _onDataReceived(result: IQueryResult<Transfer>): void {
    this.isPending = false;
    this.loaded = result.items.length;
    this._transfers = result.items;
    this.totalCount = result.count;

    this._loadProgressService.hide(1);
    this.inProgress = false;
    this.noProgress = !this.totalCount;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _load(): void {
    const query = new Query<TransferFilterResult>({
      filter: {
        ...this._transferService.transferFilter$.getValue().filter,
        requestId: sessionStorage.getItem('requestId'),
      },
      withCount: true,
    });
    this._transferService.result(query);
  }

  private _setDS(): void {
    this._transfers.forEach((transfer) => transfer.vehicles.forEach((value) => value.providerName = transfer.providerName));
    const vehicles = [].concat.apply([], this._transfers.map((transfer) => {
      transfer.vehicles.forEach((vehicle) => vehicle.transferId = transfer.id);
      return transfer.vehicles;
    }));
    this.dataSource$.next(vehicles);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _fillFromHistory(): void {
    this._history.getMinimalByRequestId('transfer')
    .pipe(
      takeUntil(this._destroy$),
    )
    .subscribe({
      next: (history: TransferFilter) => {
        this.filter = history;
        this.location = history.routes[0].fromLocation;
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      },
    });
  }

  private _onSearchResult(): void {
    const latest$ = this._notify.searchResult$
    .pipe(
      filter(Boolean),
      takeUntil(this._destroy$),
    );
    latest$.subscribe((result) => {
      const requestId = sessionStorage.getItem('requestId');
      result.requestId === requestId && this._load();
    });
  }

  private _onResultReady(): void {
    this._transferService.result$
    .pipe(
      filter(Boolean),
      takeUntil(this._destroy$),
    )
    .subscribe({
      next: (result) => {
        this._onDataReceived(result);
        this._setDS();
      },
    });
  }

}
