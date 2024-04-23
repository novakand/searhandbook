import { Injectable } from '@angular/core';

// external libs
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// inner libs
import { HttpClientService, IOrder, IQueryResult, LoadProgressService, Query, SignalrService, Utils } from 'h21-be-ui-kit';

// models
import { Transfer, TransferFilter, TransferFilterResult } from '../models';

// interfaces
import { ISearchRequestInfo } from '@components/search/interfaces/search-request-info.interface';

// environment
import { environment } from '@environments/environment';

const defTransferFilter = new TransferFilterResult({ minCost: 0, maxCost: 1000 });

const defFilter = new Query<any>({ filter: defTransferFilter, withCount: true });

@Injectable()
export class TransferService {

  public filterResult$ = new Subject<IOrder>();
  public result$ = new BehaviorSubject<IQueryResult<Transfer>>(null);

  public fakeFilter$ = new BehaviorSubject<Query<TransferFilterResult>>(Utils.deepCopy(defFilter));
  public transferFilter$ = new BehaviorSubject<Query<TransferFilterResult>>(Utils.deepCopy(defFilter));

  constructor(
    private _http: HttpClientService,
    private _notification: SignalrService,
    private _loadProgressService: LoadProgressService,
  ) { }

  public search(filter: TransferFilter): Observable<ISearchRequestInfo> {
    filter.connectionId = this._notification.context.connectionId;
    return this._http.post<ISearchRequestInfo>(`${environment.core.apiRootUrl}Transfer/Search`, filter);
  }

  public getByVehicleId(id: string): Observable<Transfer> {
    return this._http.get<Transfer>(`${environment.core.apiRootUrl}Transfer/GetTransfer/${id}`);
  }

  public book(filter: TransferFilter): Observable<void> {
    return this._http.post<void>(`${environment.core.apiRootUrl}Transfer/Search`, filter);
  }

  public result(filter: Query<TransferFilterResult>): void {
    this._loadProgressService.show(1);
    this._http.post<any>(`${environment.core.apiRootUrl}Transfer/Result`, filter)
      .subscribe((value) => {
        this.result$.next(value);
        this._loadProgressService.hide(1);
      });
  }

  public resetFilter(): Query<TransferFilterResult> {
    const filter = Utils.deepCopy(defFilter);
    this.transferFilter$.next(filter);
    this.fakeFilter$.next(filter);
    return filter;
  }

}
