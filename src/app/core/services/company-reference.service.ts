import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { Observable } from 'rxjs';

// environment
import { environment } from '@environments/environment';

// interfaces
import { ICompanyReference } from '@core/interfaces/company-reference.interface';

@Injectable()
export class CompanyReferenceService {

  private _entity = 'CompanyReference';

  constructor(private _http: HttpClient) {}

  public getByTravelerId(id: number): Observable<ICompanyReference[]> {
    return this._http.get<ICompanyReference[]>(`${environment.apiGatewayUri}${this._entity}/GetByTravelerId?travelerId=${id}`);
  }

}
