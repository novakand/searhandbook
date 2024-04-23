import { Injectable } from '@angular/core';

// lib
import { HttpClientService, Query } from 'h21-be-ui-kit';

// interfaces
import { ITripFilter, ITripRoom } from '@components/search/hotel/interfaces';

// rxjs
import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

// environment
import { environment } from '@environments/environment';

@Injectable()
export class SelectTripService {

  constructor(private _http: HttpClientService) {}

  public getTrips(queryFilter: Query<ITripFilter>): Observable<ITripRoom[]> {
    return this._http.post(`${environment.apiOrderUri}Trip/GetSelectList`, queryFilter)
      .pipe(pluck('items'));
  }

}
