import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { Observable } from 'rxjs';

// environment
import { environment } from '@environments/environment';

// models
import { HotelFilter } from '../models';

// enums
import { SearchKind } from '@app/enums';

@Injectable()
export class ShareSearchRequestService {

  private _entity = 'ShareSearchRequest';

  constructor(private _http: HttpClient) { }

  public getLink(filter: HotelFilter, searchKind: SearchKind): Observable<string> {
    const linkInfo = { searchKind, transfer: null, hotel: null };
    searchKind === SearchKind.transfer && (linkInfo.transfer = filter);
    searchKind === SearchKind.hotel && (linkInfo.hotel = filter);

    return this._http.post(
      `${environment.apiGatewayUri}${this._entity}/GenerateSearchRequestLink`,
      linkInfo,
      { responseType: 'text' },
    );
  }

  public getFilterById<T>(id: string): Observable<T> {
    return this._http.get<T>(`${environment.apiGatewayUri}${this._entity}/Get?id=${id}`);
  }

}
