import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

// inner libs
import { INamedEntity, IQueryResult, Query } from 'h21-be-ui-kit';

// models
import { SupplierFilter } from './supplier-filter.model';
import { FacilityFilter } from './facility-filter.model';

// environment
import { environment } from '@environments/environment';

@Injectable()
export class HotelSearchFilterService {

  constructor(
    private _http: HttpClient,
  ) { }

  public findSuppliers(): Observable<INamedEntity[]> {
    const query = new Query<SupplierFilter>({
      filter: new SupplierFilter({ groupId: 0x2 }),
      withCount: false,
    });
    return this._http.post<INamedEntity[]>(`${environment.core.referencesUrl}ProviderType/PostQuery`, query)
      .pipe(
        pluck<IQueryResult<INamedEntity>, INamedEntity[]>('items'),
      );
  }

  public findFacilities(): Observable<INamedEntity[]> {
    const query = new Query<FacilityFilter>({
      filter: new FacilityFilter({ isVisible: true }),
      withCount: false,
    });
    return this._http.post<INamedEntity[]>(`${environment.apiHotelUri}Facility/PostQuery`, query)
      .pipe(
        pluck<IQueryResult<INamedEntity>, INamedEntity[]>('items'),
      );
  }

}
