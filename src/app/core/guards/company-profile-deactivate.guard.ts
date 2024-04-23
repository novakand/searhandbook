import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';

// external libs
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// services
import { StorageService } from '@core/services';

@Injectable({
  providedIn: 'root',
  deps: [StorageService],
})
export class CompanyProfileDeactivateGuard implements CanDeactivate<Boolean> {

  constructor(
    private _storage: StorageService,
  ) { }

  public canDeactivate(component): Observable<boolean> {
    this._storage.globalUiSettings$.next(null);
    return this._storage.initCompanySetting().pipe(map(() => true));
  }

}
