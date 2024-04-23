import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// external libs
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, pluck, tap } from 'rxjs/operators';

// inner libs
import { Query, SignalrService, Utils } from 'h21-be-ui-kit';

// models
import { HotelConfirm, HotelFilter, HotelFilterResult, SortField } from '@components/search/hotel/models';

// interfaces
import { IBrandPidMin, IHotelSearchResultItem, IRoomBatchId, IRoomRate } from '@components/search/hotel/interfaces';
import { ISearchRequestInfo } from '@components/search/interfaces';

// environment
import { environment } from '@environments/environment';

// enums
import { PoiDistanceType, PriceType } from '@components/search/hotel/enums';

const defHotelFilter = new HotelFilterResult({
  priceGreaterEqual: 0,
  priceLessEqual: 1000,
  isRefundable: null,
  isBreakfastIncluded: null,
  priceCalculation: PriceType.perNight,
  hotelPossibleRatings: [],
  minBookingRating: null,
  carbonFootprintCodes: [],
  suppliers: [],
  facilities: [],
  distanceCalculation: PoiDistanceType.car,
});

export const defFilter = new Query<HotelFilterResult>({
  filter: defHotelFilter,
  withCount: true,
  order: [new SortField('minTotalCost', false, 'Price')],
});

@Injectable({
  providedIn: 'root',
})
export class HotelRoomService {

  public hotelClick$ = new Subject<number>();
  public distanceCeil$ = new Subject<number>();
  public defHotelFilter = Utils.deepCopy(defHotelFilter);
  public distance$ = new BehaviorSubject<number>(0);
  public needUpdateLists$: Subject<void> = new Subject<void>();
  public search$ = new BehaviorSubject<IHotelSearchResultItem[]>(null);
  public hotelFilter$ = new BehaviorSubject<Query<HotelFilterResult>>(Utils.deepCopy(defFilter));
  public fakeFilter$ = new BehaviorSubject<Query<HotelFilterResult>>(Utils.deepCopy(defFilter));

  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _notification: SignalrService,
  ) { }

  public searchAsync(filter: HotelFilter): Observable<ISearchRequestInfo> {
    filter.connectionId = this._notification.context.connectionId;
    return this._http.post<ISearchRequestInfo>(`${environment.apiGatewayUri}HotelSearch/SendInitialRequestAsync`, filter)
      .pipe(
        tap((info) => {
          sessionStorage.setItem('requestId', info.requestId);
          this._router.navigateByUrl('/search/hotel/result');
        }),
      );
  }

  public searchUpdateAsync(filter: HotelFilter): Observable<ISearchRequestInfo> {
    filter.connectionId = this._notification.context.connectionId;
    return this._http.post<ISearchRequestInfo>(`${environment.apiGatewayUri}HotelSearch/SendUpdatedRequestAsync`, filter)
      .pipe(
        tap((data) => this.distanceCeil$.next(data.filterInitialization.distanceLessEqual || 0)),
      );
  }

  public getHotelRoomsBatchByHotelId(filter: HotelFilter): Observable<string> {
    filter.connectionId = this._notification.context.connectionId;
    return this._http.post<IRoomBatchId>(`${ environment.apiHotelUri }HotelRoomSearch/GetHotelRoomsBatchByHotelId`, filter)
      .pipe(
        pluck('batchId'),
      );
  }

  public getRoomsBatchId(id: string, body: IBrandPidMin): Observable<string> {
    const data = {
      requestId: id,
      brandPid: body,
      connectionId: this._notification.context.connectionId,
    };
    return this._http.post<IRoomBatchId>(`${ environment.apiHotelUri }HotelRoomSearch/GetHotelRoomsBatchId`, data)
      .pipe(
        pluck('batchId'),
      );
  }

  public getRoomsList(body: Query<HotelFilterResult>): Observable<IRoomRate[]> {
    return this._http.post<IRoomRate[]>(`${ environment.apiHotelUri }HotelRoomSearch/GetRoomResponse`, body)
      .pipe(
        pluck('items'),
        tap((items: IRoomRate[]) => items.map((item) => !item.hasOwnProperty('isRefundable') && (item.isRefundable = null))),
      );
  }

  public responseAsync(filter: Query<HotelFilterResult>, field: string): void {
    const responseId = sessionStorage.getItem('requestId');
    if (!responseId) {
      this._router.navigateByUrl('/search/hotel');
      return;
    }
    filter.filter.responseId = responseId;
    filter.filter.firstHotelId = +sessionStorage.getItem('hotelId');

    this._http.post<any>(`${environment.apiGatewayUri}HotelSearch/GetResponseAsync`, filter)
      .pipe(
        tap((data) => this.distance$.next(data.filter.maxDistanceByCar || 0)),
        pluck('items'),
      )
      .subscribe((data: IHotelSearchResultItem[]) => this[field].next(data));
  }

  public resetFilter(): Query<HotelFilterResult> {
    const filter = Utils.deepCopy(defFilter);
    this.hotelFilter$.next(filter);
    this.fakeFilter$.next(filter);
    return filter;
  }

}
