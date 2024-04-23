import { CanLoad, Route, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { OAuthService } from 'angular-oauth2-oidc';
import { map, mergeMap } from 'rxjs/operators';
import { forkJoin, from, Observable, of } from 'rxjs';

// inner libs
import { CompanyProfileSetting, IIdentityClaims } from 'h21-be-ui-kit';

// environment
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanLoad {

  constructor(private router: Router,
              private _http: HttpClient,
              private _auth: OAuthService,
  ) { }

  public canLoad(route: Route): Observable<boolean> {
    return forkJoin(
      this.hasAccess(),
      this._isGlobalAdmin(),
    )
    .pipe(
      map(([isAdmin, isGlobalAdmin]) => {
        if (isGlobalAdmin || isAdmin) { return true; }
        this.router.navigate(['access-denied']);
        return false;
      }),
    );
  }

  public hasAccess(): Observable<boolean> {
    const entity = 'UserProfileSetting';
    const baseUrl = `${environment.core.profileApi}${entity}`;

    return this._http.get<CompanyProfileSetting>(`${baseUrl}/GetSettings`)
    .pipe(
      map((setting) => this._hasAccessByRoles(setting)),
    );
  }

  private _hasAccessByRoles(setting: CompanyProfileSetting): boolean {
    const adminRoles = ['admin', 'booker', 'SB'];

    if (!setting.agentofficeRoles) {
      return false;
    }

    return adminRoles.some((role) => setting.agentofficeRoles.includes(role));
  }

  private _isGlobalAdmin(): Observable<boolean> {
    return from(this._auth.loadUserProfile())
    .pipe(
      mergeMap((claims: IIdentityClaims) => of(this._isAdminByClaims(claims))),
    );
  }

  private _isAdminByClaims(claims: IIdentityClaims): boolean {
    const allowedRoles: string[] = ['admin'];
    const role = claims.role;
    return role && !!allowedRoles.find((item) => role.includes(item));
  }

}
