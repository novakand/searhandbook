import { Injectable } from '@angular/core';

import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

// external libs
import { Application, HttpClientService, ICompany, IQueryResult, Query } from 'h21-be-ui-kit';

// models
import { PaymentFilter, TravelerFilter } from '@components/search/models';

// interfaces
import { IDocumentType, IPayment, ITraveler, ITravelerList } from '@components/search/interfaces';

// environment
import { environment } from '@environments/environment';

@Injectable()
export class TravelerService {

  private _travelerBaseUrl = `${environment.core.profileApi}TravelerProfile/`;
  private _travelerPostQueryUrlAddress = `${this._travelerBaseUrl}PostQueryWithCountry`;
  private _travelerPaymentUrl = `${environment.core.profileApi}TravelerFormPayment/PostQuery`;

  constructor(
    private _http: HttpClientService,
  ) { }

  public getTravelerListWithAddress(filter: Query<TravelerFilter>): Observable<IQueryResult<ITravelerList>> {
    return this._http.post<IQueryResult<ITravelerList>>(this._travelerPostQueryUrlAddress, filter);
  }

  public getPaymentInfo(filter: Query<PaymentFilter>): Observable<IPayment[]> {
    return this._http.post<IQueryResult<IPayment>>(this._travelerPaymentUrl, filter)
    .pipe(
      pluck('items'),
    );
  }

  public getDocumentType(): Observable<IDocumentType[]> {
    return this._http.post<IDocumentType[]>(`${environment.core.profileApi}TravelerDocumentType/PostQuery`, {})
      .pipe(
        pluck('items'),
      );
  }

  public getCompanies(): Observable<ICompany[]> {
    const corpTypeId = 6;
    const filter = new Query({
        filter: {
          childTypeIdIn: [corpTypeId],
          application: Application.AGENT_OFFICE,
        },
      },
    );
    return this._http.post(`${environment.core.profileApi}CompanyProfile/PostQuery`, filter)
      .pipe(
        pluck('items'),
      );
  }

  public saveTraveller(travelerDto: ITraveler): Observable<ITraveler> {
    return this._http.post<ITraveler>(`${this._travelerBaseUrl}SaveTraveler`, travelerDto);
  }

}
