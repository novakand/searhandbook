import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/';

import { HttpClientService } from 'h21-be-ui-kit';

import { environment } from 'environments/environment';
import { INemoResult } from '@core/interfaces';

@Injectable()
export class NemoAuthService {

  private _url = 'https://horse.nemo.travel/';

  constructor(private _http: HttpClientService) { }

  public auth(): Observable<INemoResult> {
    return this._http.post<INemoResult>(this._urlJoin(environment.core.connectorApi, 'nemo', 'auth'), {});
  }

  public getAuthUrl(): string {
    return this._urlJoin(this._urlJoin(this._url, 'api__external_authorization'));
  }

  private _urlJoin(...params: string[]): string {
    let path = '';
    Object.keys(params).forEach((key) => {
      path = Location.joinWithSlash(path, params[key]);
    });
    return path;
  }

}
