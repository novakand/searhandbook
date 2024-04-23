import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewRef
} from '@angular/core';

// external libs
import { filter, map, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';
import { BehaviorSubject, iif, Observable, of, range, Subject } from 'rxjs';
import { isEqual, reduce } from 'lodash';

// inner libs
import { Query, Utils } from 'h21-be-ui-kit';

// interfaces
import { IHotelSearchResultItem, IRoomListBatch, IRoomRate } from '@hotel/interfaces';

// models
import { HotelFilter, HotelFilterResult } from '@hotel/models';

// services
import { HotelRoomService } from '@hotel/services';

import 'rxjs/add/observable/of';

@Component({
  selector: 'h21-hotel-rooms-list',
  templateUrl: './hotel-rooms-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelRoomsListComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public batchId: string;
  @Input() public filter: HotelFilter;
  @Input() public hotelCardMode = false;
  @Input() public data: IHotelSearchResultItem;

  @Output() public emitData: EventEmitter<IRoomListBatch> = new EventEmitter<IRoomListBatch>();

  public failed: string;

  public roomFilter$ = new BehaviorSubject<Query<HotelFilterResult>>(Utils.deepCopy(this._service.hotelFilter$.getValue()));
  public loaderCount$: Observable<number[]> = range(0x1, 0x3).pipe(toArray());
  public rooms$: Observable<IRoomRate[]>;

  private prev = Utils.deepCopy(this._service.hotelFilter$.getValue());
  private _destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _service: HotelRoomService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.batchId && changes.batchId.currentValue) {
      this.hotelCardMode && this._getRoomsByBatchId();
    }
  }

  public ngOnInit(): void {
    !this.hotelCardMode && this._setRoomsStream();
    this._filterListener();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public updateFilter(data: Query<HotelFilterResult>, field: string): void {
    data.filter[field] = data.filter[field] ? null : true;
    this.roomFilter$.next(data);
    this.hotelCardMode && this._getRoomsByBatchId();
  }

  public trackByFn(index: number, item: IHotelSearchResultItem): number {
    return item.id;
  }

  private _setBatchId(id: string): Query<HotelFilterResult> {
    const result = this.roomFilter$.getValue();
    result.filter.batchIdEqual = id;
    return result;
  }

  private _getRooms(): Observable<string> {
    if (this.data.roomsBatchId) {
      return of(this.data.roomsBatchId);
    }
    return this._service.getRoomsBatchId(this.data.requestId, this.data.brandPidMin);
  }

  private _setRoomsList(list: IRoomRate[]): void {
    !this.batchId && (this.failed = 'No rooms found, try again later.');
    this.emitData.emit({ list: list, batchId: this.batchId });
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _getRoomsByBatchId(): void {
    this.rooms$ = this._service.getRoomsList(this._setBatchId(this.batchId))
      .pipe(
        tap((list) => this._setRoomsList(list)),
      );
  }

  private _setRoomsStream(): void {
    this.rooms$ = this.roomFilter$
      .pipe(
        tap(() => this.prev = Utils.deepCopy(this._service.hotelFilter$.getValue())),
        filter(Boolean),
        switchMap(() => iif(() => Boolean(this.batchId), of(this.batchId), this._getRooms())),
        tap((id) => this.batchId = id),
        map((batchId) => this._setBatchId(batchId)),
        switchMap((value) => iif(() => Boolean(this.batchId), this._service.getRoomsList(value), of([]))),
        tap((list) => this._setRoomsList(list)),
      );
  }

  private _filterListener(): void {
    const hotelFilter$ = this._service.hotelFilter$
        .pipe(
          map((data) => this._updateFilter(data)),
          takeUntil(this._destroy$),
        );
    hotelFilter$.subscribe((data) => this._onFilterChanged(data));
  }

  private _onFilterChanged(data: Query<HotelFilterResult>): void {
    const current = Utils.deepCopy(this.roomFilter$.getValue());
    const fields = reduce(data.filter, (result, value, key) =>
      isEqual(value, this.prev.filter[key]) ? result : result.concat(key), [],
    );
    current.filter[fields[0]] = fields.length ? data.filter[fields[0]] : this.prev.filter[fields[0]];
    this.roomFilter$.next(current);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _updateFilter(data: Query<HotelFilterResult>): Query<HotelFilterResult> {
    data.filter.isBreakfastIncluded = data.filter.isBreakfastIncluded || null;
    data.filter.isRefundable = data.filter.isRefundable || null;
    return data;
  }

}
