import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external operators
import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

// libs
import { INamedEntity, Query } from 'h21-be-ui-kit';

// models
import { TimezoneFilter } from '@core/models/timezone-filter.model';

// environment
import { environment } from '@environments/environment';

@Injectable()
export class TimezoneService {

  private _entity = 'TimeZoneDictionary';

  constructor(private _http: HttpClient) { }

  public getTimezones(filter?: Query<TimezoneFilter>): Observable<INamedEntity[]> {
    return this._http.post<INamedEntity[]>(`${environment.core.profileApi}${this._entity}/PostQuery`, filter)
      .pipe(
        pluck('items'),
      );
  }

}

