import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// external libs
import { OAuthService } from 'angular-oauth2-oidc';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// inner libs
import { IFileInfo, Utils } from 'h21-be-ui-kit';

// environment
import { environment } from '@environments/environment';

// components
import { SearchComponent } from '../search.component';

// services
import { StorageService } from '@core/services';

// enums
import { ServicesType } from '@app/enums';

@Injectable()
export class SearchService {

  public cmp: SearchComponent;

  private _globalUiSettings$ = this._storage.globalUiSettings$
    .pipe(
      filter(Boolean),
    );

  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _auth: OAuthService,
    private _storage: StorageService,
  ) { }

  public loadImg(info: IFileInfo): Observable<string> {
    const url = `${environment.core.fileStorageUrl}DownloadPublicFile?hash=${info.fileHash}&name=photo`;
    return this._http.get(url, { responseType: 'blob' })
    .pipe(
      map((data) => Utils.getUrlFromBlob(info.fileName, data)),
    );
  }

  public checkAccessToRoute(): void {
    this._globalUiSettings$.subscribe((items) => {
      const url = this._router.url;
      if (url.includes('/search') && this._hasNoExcludedRoutes(url)) {
        this._hasNoAccess(items) && this._redirect();
      }
    });
  }

  private _hasNoExcludedRoutes(url: string): boolean {
    const excludedList = ['/history', '/poi', '/favorites', '/payvision'];
    return excludedList.every((route) => !url.includes(route));
  }

  private _hasNoAccess(items): boolean {
    return !items.find((service) => {
      const serviceName = service.serviceName.split(' ')[0].toLowerCase();
      return this._router.url.includes(serviceName);
    }).isShow;
  }

  private _redirect(): void {
    const uiMap = this._storage.globalUiMap$.value;

    if (uiMap[ServicesType.newHotelBooking]) {
      this._router.navigate(['/search/hotel']);
      return;
    } else if (uiMap[ServicesType.transferBooking]) {
      this._router.navigate(['/search/transfer']);
      return;
    }

    this._auth.logOut();
  }

}
