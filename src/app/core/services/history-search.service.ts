import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';

// external libs
import { BehaviorSubject, Observable } from 'rxjs';
import { map, pluck, tap } from 'rxjs/operators';

// inner libs
import { Query } from 'h21-be-ui-kit';

// models
import { TransferFilter } from '@components/search/transfer/models';
import { HistorySearchFilter } from '@components/search/models';
import { HotelFilter } from '@components/search/hotel/models';

// environment
import { environment } from '@environments/environment';

// interfaces
import { ISearchFilter } from '@components/search/interfaces';

// services
import { ShareSearchRequestService } from '@hotel/services';

// enums
import { SearchKind } from '@app/enums';

@Injectable()
export class HistorySearchService {

  public refresh$ = new BehaviorSubject<boolean>(false);
  public current$ = new BehaviorSubject<TransferFilter | HotelFilter>(null);

  private _entity = 'HistorySearchRequest';

  constructor(
    private _http: HttpClient,
    private _activated: ActivatedRoute,
    private _share: ShareSearchRequestService,
  ) { }

  public saveHotelSearch(history: HotelFilter): Observable<string> {
    const body = { hotel: history, searchKind: SearchKind.hotel };
    return this._http.post<ISearchFilter>(`${environment.apiGatewayUri}${this._entity}/PostEntity`, body)
      .pipe(
        pluck('id'),
      );
  }

  public getById(id: string): Observable<ISearchFilter> {
    return this._http.get<ISearchFilter>(`${environment.apiGatewayUri}${this._entity}/GetById/${id}`);
  }

  public getMinimalByRequestId<T>(property: string): Observable<T> {
    const id = sessionStorage.getItem('requestId');
    return this._http.get<ISearchFilter>(`${environment.apiGatewayUri}${this._entity}/GetMinimalByRequestId/${id}`)
      .pipe(
        map((item) => {
          const value = item[property] || {};
          this.current$.next(value);
          return value;
        }),
      );
  }

  public getByRequestId<T>(property: string): Observable<T> {
    const id = sessionStorage.getItem('requestId');
    return this._http.get<ISearchFilter>(`${environment.apiGatewayUri}${this._entity}/GetByRequestId/${id}`)
    .pipe(
      map((item) => item[property] || {}),
    );
  }

  public postQueryMinimal(query: Query<HistorySearchFilter>): Observable<ISearchFilter[]> {
    return this._http.post<ISearchFilter[]>(`${environment.apiGatewayUri}${this._entity}/PostQueryMinimal`, query)
    .pipe(
      pluck('items'),
    );
  }

  public getTransferHistoryRequest(routeReadyAction: () => void, isRestoreAction: () => void): Observable<TransferFilter> {
    const id = this._activated.snapshot.queryParams.id;
    const isRestore = this._activated.snapshot.queryParams.isRestore;
    const restoreById = this._activated.snapshot.queryParams.restoreById;

    if (!isRestore && !restoreById && !id) {
      routeReadyAction();
      return;
    }

    if (isRestore) {
      isRestoreAction();
      return this.getMinimalByRequestId<TransferFilter>('transfer');
    }

    if (restoreById) {
      return this.getById(restoreById)
      .pipe(
        pluck<ISearchFilter, TransferFilter>('transfer'),
      );
    }
    return id && this._share.getFilterById<TransferFilter>(id)
    .pipe(
      pluck('transfer'),
      tap((item: TransferFilter) => item.primaryTraveler = null),
    );
  }

  public getHotelHistoryRequest(action: () => void): Observable<HotelFilter> {
    const id = this._activated.snapshot.queryParams.id;
    const isRestore = this._activated.snapshot.queryParams.isRestore;
    const restoreById = this._activated.snapshot.queryParams.restoreById;

    if (isRestore) {
      action();
      return this.getByRequestId<HotelFilter>('hotel');
    }
    if (restoreById) {
      return this.getById(restoreById)
      .pipe(
        pluck<ISearchFilter, HotelFilter>('hotel'),
      );
    }
    return id && this._share.getFilterById<HotelFilter>(id)
    .pipe(
      pluck('hotel'),
      tap((item: HotelFilter) => item.primaryTraveler = null),
    );
  }

}
