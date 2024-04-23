import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// external libs
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

// inner libs
import { LoadProgressService, Query, Utils } from 'h21-be-ui-kit';
import { PointAddress } from 'h21-map';

// interfaces
import { IHotelSearchResultItem } from '@hotel/interfaces';
import { ISearchNotification } from '@transfer/interfaces';

// services
import { HistorySearchService, NotificationSignalRService, StorageService } from '@core/services';
import { HotelRoomService } from '@hotel/services';
import { SearchSidenavService } from '@search/components/search/services/search-sidenav.service';

// components
import { HotelSearchResultUpdateNotificationComponent } from '../hotel-search-result-update-notification';
import { HotelSearchResultMapDialogComponent } from '../hotel-search-result-map-dialog';

// models
import { HotelFilter, HotelFilterResult, SortField } from '@hotel/models';
import { IHotelsInBatch } from '@components/bookings';

const sortableFields = [
  new SortField('minTotalCost', false, 'Price'),
  new SortField('minTotalCost', true, 'Price'),
  new SortField('HotelRating', false, 'Rating'),
  new SortField('HotelRating', true, 'Rating'),
  new SortField('DistanceByCar', false, 'Distance'),
  new SortField('DistanceByCar', true, 'Distance'),
];

const searchResultGroups = [
  'Search result',
  'Favorites',
];

@Component({
  selector: 'h21-hotel-search-result',
  templateUrl: './hotel-search-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelSearchResultComponent implements OnInit, OnDestroy {

  public formFieldAppearance = 'outline';
  public dataSearch: IHotelSearchResultItem[] = [];
  public dataFavorites: IHotelSearchResultItem[] = [];

  public location: PointAddress;

  public tabletMode: boolean;
  public isPending: boolean;
  public sortByList = sortableFields;
  public searchData: ISearchNotification = {};
  public notifyState: ISearchNotification = {};

  public currentSort: SortField = this.sortByList[0];
  public searchResultGroupsList = searchResultGroups;
  public currentGroup: string = this.searchResultGroupsList[0];

  public inProgress = true;
  public noProgress: boolean;

  public counts3 = [1, 2, 3];
  public counts5 = [1, 2, 3, 4, 5];

  public filter$ = this._history.getMinimalByRequestId<HotelFilter>('hotel');

  public main$ = this._service.search$
    .pipe(
      filter(Boolean),
      tap((list) => this._onLoad(list)),
    );

  private _isOpen: boolean;
  private _isBack = this._route.snapshot.queryParams.isBack;
  private _firstHotelsIsReceive: boolean;

  private _destroy$ = new Subject<boolean>();
  private _updateNotificationRef: MatSnackBarRef<HotelSearchResultUpdateNotificationComponent>;

  constructor(
    private _http: HttpClient,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _service: HotelRoomService,
    private _history: HistorySearchService,
    private _notify: NotificationSignalRService,
    private _sidenavService: SearchSidenavService,
    private _breakpointObserver: BreakpointObserver,
    private _loadProgressService: LoadProgressService,
  ) {
    this._setRequestId();
    this._loadProgressService.show(10);

    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        this._cdr.markForCheck();
      });
  }

  public ngOnInit(): void {
    this._notifyListener();
    this._filterListener();
    this._refreshHistoryListener();
    this._sidenavService.opened$.next(false);
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();

    this._service.search$.next(null);
    this._updateNotificationRef && this._updateNotificationRef.dismiss();
  }

  public trackByFn(index: number, item: IHotelSearchResultItem): number {
    return item.id;
  }

  public showResultOnMap(): void {
    this._dialog.open(HotelSearchResultMapDialogComponent, {
      data: {
        hotelId: (<HotelFilter> this._history.current$.value).hotelId,
      },
      width: '100%',
      height: '100%',
      autoFocus: false,
      maxWidth: '100vw',
      disableClose: true,
      backdropClass: 'h21-dialog_dark-backdrop',
      panelClass: 'hotel-search-result-map-dialog_panel',
    });
  }

  public updateList(item: IHotelSearchResultItem): void {
    this.dataSearch.forEach((v) => v.id === item.id && (v.isFavorite = item.isFavorite));
    this.dataFavorites = this.dataSearch.filter((v) => v.isFavorite);
  }

  public updateFavorites(): void {
    this.dataFavorites = this.dataFavorites.filter((v) => v.isFavorite);
  }

  public loadByType(group: string): void {
    this.currentGroup = group;
    this._setAnimation(false, this._isNoProgress());
  }

  public onSortChange(sortField: SortField): void {
    this.currentSort = sortField;
    this._setAnimation(true, false);
    this._loadProgressService.show(1);

    const query = this._service.hotelFilter$.getValue();
    query.order = [{
      field: sortField.field,
      desc: sortField.desc,
    }];
    this._service.hotelFilter$.next(query);
  }

  public toggleFilterVisibility(): void {
    this._sidenavService.opened$.next(!this._sidenavService.opened$.getValue());
  }

  private _filterListener(): void {
    const filter$ = this._service.hotelFilter$.pipe(takeUntil(this._destroy$));
    filter$.subscribe((value) => {
      this._loadProgressService.show(1);
      this._isOpen ?
        this._updateNotificationRef.dismiss() :
        this._load(value);
    });
  }

  private _isNoProgress(): boolean {
    const currentList = this.currentGroup === 'Favorites' ? this.dataFavorites : this.dataSearch;
    return this.notifyState.isCompleted && currentList.length === 0;
  }

  private _isInProgress(): boolean {
    const currentList = this.currentGroup === 'Favorites' ? this.dataFavorites : this.dataSearch;
    return !this.notifyState.isCompleted && !currentList.length;
  }

  private _onLoad(items): void {
    (this.notifyState.isCompleted || this._isBack) && this._loadProgressService.hide(10);

    this.dataSearch = items;
    this.dataFavorites = this.dataSearch.filter((v) => v.isFavorite);
    this._setAnimation(this._isInProgress(), this._isNoProgress());
    this.searchData = this.notifyState;
    this._cdr.detectChanges();
  }

  private _openUpdateNotification(counter: number = 0): void {
    this._isOpen = true;
    const data = { counter: counter };

    this._updateNotificationRef = this._snackBar.openFromComponent(HotelSearchResultUpdateNotificationComponent, {
      data: data,
      panelClass: 'hotel-search-result-update-notification_panel',
    });

    const snackRef$ = this._updateNotificationRef.afterDismissed().pipe(takeUntil(this._destroy$));
    snackRef$.subscribe(() => {
      const value = this._storage.hotelsInBatchData$.getValue();
      this._loadWithCopy(value.map((x) => x.batchId));
      value.forEach((x) => x.isShown = true);
      this._storage.hotelsInBatchData$.next(value);
      this._isOpen = false;
    });
  }

  private _refreshHistoryListener(): void {
    const refresh$ = this._history.refresh$
      .pipe(
        filter((val) => !!val),
        tap(() => this._cleanUp()),
        switchMap(() => this._history.getMinimalByRequestId<HotelFilter>('hotel')),
        takeUntil(this._destroy$),
      );
    refresh$.subscribe((data) => {
      this.filter$ = of(data);
      this._cdr.detectChanges();
    });
  }

  private _cleanUp(): void {
    this.dataSearch = [];
    this.dataFavorites = [];
    this.inProgress = true;
    this.noProgress = false;
    this._firstHotelsIsReceive = false;
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
        this.notifyState = result;
        result.count && this._openOrLoad(result);
      }
    });
  }

  private _openOrLoad(result: ISearchNotification): void {
    const hotelsInBatch = {
      count: result.count,
      isShown: false,
      batchId: result.batchId,
    };

    if (this._firstHotelsIsReceive || this.dataSearch && this.dataSearch.length) {
      const savedHotelsBatches = this._storage.hotelsInBatchData$.getValue();

      !savedHotelsBatches.map((x) => x.batchId).includes(hotelsInBatch.batchId) && savedHotelsBatches.push(hotelsInBatch);
      savedHotelsBatches && this._openNotification(savedHotelsBatches);
    } else {
      hotelsInBatch.isShown = true;
      this._firstHotelsIsReceive = true;
      this._storage.hotelsInBatchData$.next([hotelsInBatch]);
      this._loadWithCopy([hotelsInBatch.batchId]);
    }

    result.isCompleted && this._onIsCompleted();
  }

  private _loadWithCopy(batchesToView: string[]): void {
    const query = Utils.deepCopy(this._service.hotelFilter$.getValue());
    query.filter.batchesIdIn = batchesToView;
    this._load(query);
  }

  private _openNotification(hotelsInBatches: IHotelsInBatch[]): void {
    this._storage.hotelsInBatchData$.next(hotelsInBatches);

    if (!this._isOpen) {
      const countHotelsToView = this._storage.countHotelsToView(hotelsInBatches);
      countHotelsToView > 0 && this._openUpdateNotification(countHotelsToView);
    }
  }

  private _onIsCompleted(): void {
    !this._isBack && this._setAnimation(false, this._isNoProgress());
    this._loadProgressService.hide(10);
    this.searchData = this.notifyState;
    this._cdr.detectChanges();
  }

  private _load(query: Query<HotelFilterResult>): void {
    this._service.responseAsync(query, 'search$');
  }

  private _setAnimation(inProgress: boolean, noProgress: boolean): void {
    this.inProgress = inProgress;
    this.noProgress = noProgress;
  }

  private _setRequestId(): void {
    const requestId = this._route.snapshot.queryParams.requestId;
    requestId && sessionStorage.setItem('requestId', requestId);
  }

}
