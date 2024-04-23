import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

// external libs
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

// internal libs
import { PermissionService } from 'h21-be-ui-kit';

// token
import { searchNavigationTabs } from './search-navigation-toolbar.token';

// services
import { StorageService } from '@core/services';

// interfaces
import { ICompanyUiService } from '@core/interfaces';

@Component({
  selector: 'h21-search-navigation-toolbar',
  templateUrl: './search-navigation-toolbar.component.html',
  styleUrls: [ './search-navigation-toolbar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchNavigationToolbarComponent implements OnInit, OnDestroy {

  public tabs = searchNavigationTabs;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _permissions: PermissionService,
  ) { }

  public ngOnInit(): void {
    this._getActualServices();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn = (index: number): number => index;

  private _getActualServices(): void {
    this._storage.globalUiSettings$
      .pipe(
        filter(Boolean),
        map((services: ICompanyUiService[]) => services.filter((service) => service.isShow)),
        tap((services) => this.tabs = this._getActualNavTabs(this.tabs, services)),
        switchMap(() => this._permissions.loaded$),
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this.tabs.forEach((v) => v.disabled = this._getTabState(v));
        this._cdr.detectChanges();
      });
  }

  private _getTabState(item): boolean {
    return item.disabled || !this._permissions.hasPermissions(item.name);
  }

  private _getActualNavTabs(navTabs: any[], services: ICompanyUiService[]): any[] {
    const codeList = services.map((service) => service.serviceName);
    return navTabs.filter((tab) => codeList.includes(tab.name));
  }

}
