import { Injectable, OnDestroy } from '@angular/core';
import { HttpParams } from '@angular/common/http';
// external libs
import { OAuthService } from 'angular-oauth2-oidc';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
// internal libs
import { HttpClientService, IDictionary } from 'h21-be-ui-kit';
// services
import { UriEncoderService } from './uri-encoder.service';
// environments
import { environment } from '@environments/environment';
// models
import { FirstHotelsAuth } from '@models/first-hotels-auth.model';

@Injectable({
  providedIn: 'root',
})
export class FirstHotelsAuthService implements OnDestroy {

  private _$destroy = new Subject<boolean>();

  constructor(private _http: HttpClientService,
              private _uriEncoder: UriEncoderService,
              private _authService: OAuthService) {
  }

  public auth(fields: IDictionary<string>) {
    const userFiled = 'h21pro_user_id';
    let form = new HttpParams({ encoder: this._uriEncoder });

    if (!fields.hasOwnProperty(userFiled)) {
      const claims = this._authService.getIdentityClaims();
      if (claims.hasOwnProperty(userFiled)) {

        this._checkAuthInFirstHotels()
          .pipe(takeUntil(this._$destroy))
          .subscribe((auth) => {
            const firstHotelsAuthList = auth.filter((user) => user.isAuthenticated);
            if (firstHotelsAuthList.length > 0) {
              form = form.set(userFiled, firstHotelsAuthList[0].h21ProLogin.toString());

              Object.keys(fields).forEach((field) => {
                form = form.append(field, fields[field]);
              });

              this._http.post<string>(`${ environment.core.connectorApi }FirstHotels/Auth`, form.toString())
                .pipe(takeUntil(this._$destroy))
                .subscribe((x) =>
                  this.firstHotelsRedirect(x),
                );
            } else {
              this.firstHotelsRedirect(null);
            }
          });
      } else {
        this.firstHotelsRedirect(null);
      }
    }
  }

  public firstHotelsRedirect(token: string): void {
    this._getAuthSsoTemplateUrl()
      .pipe(takeUntil(this._$destroy))
      .subscribe((urlTemplate) => {
        const url = (token && token.length > 0) ? `${ urlTemplate }${ token }` : this._getAuthSsoTemplatePageLink(urlTemplate);
        window.open(url, '_blank');
      });
  }

  public ngOnDestroy(): void {
    this._$destroy.next(true);
    this._$destroy.complete();
  }


  private _getAuthSsoTemplatePageLink(authSsoTemplateUrl: string): string {
    const pattern = /(.*)(\?.*)/;
    return authSsoTemplateUrl.replace(pattern, '$1');
  }

  private _getAuthSsoTemplateUrl(): Observable<string> {
    return this._http.get<string>(`${ environment.core.connectorApi }FirstHotels/GetAuthSsoTemplateUrl`);
  }


  private _checkAuthInFirstHotels(): Observable<FirstHotelsAuth[]> {
    return this._http.post<FirstHotelsAuth[]>(`${ environment.core.connectorApi }FirstHotels/CheckAuthListAsync`, {});
  }

}
