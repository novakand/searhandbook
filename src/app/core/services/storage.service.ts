import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

// inner libs
import {
  CompanyProfileSetting,
  H21TermsForUseService,
  ICompanyProfile, IDictionary,
  ISidebarNavTab,
  PermissionService
} from 'h21-be-ui-kit';
import { MapManager } from 'h21-map';

// enums
import { CompanyServiceTypeId } from '@app/enums';

// environments
import { environment } from '@environments/environment';

// models
import { BookingsFilterModel, IBookingsPageState, IHotelsInBatch } from '@components/bookings';

// interfaces
import { ICompanyUi, ICompanyUiService, ICompanyUiSetting } from '@core/interfaces';
import { IRoute } from '@components/search/interfaces';

// constatns
import { sidebarNavTabsConst } from '@components/app/constatns';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient, H21TermsForUseService, PermissionService],
})
export class StorageService {

  public routeReady$ = new Subject<IRoute>();
  public staticUrl$ = new BehaviorSubject<string>(null);
  public manager$ = new BehaviorSubject<MapManager>(null);
  public company$ = new BehaviorSubject<ICompanyProfile>(null);
  public hasNeededServices$ = new BehaviorSubject<boolean>(null);
  public hotelsInBatchData$ = new BehaviorSubject<IHotelsInBatch[]>([]);
  public bookingsFilter$ = new BehaviorSubject<BookingsFilterModel>(null);
  public bookingsPageState$ = new BehaviorSubject<IBookingsPageState>({});

  public uiSettings$ = new BehaviorSubject<IDictionary<boolean>>(null);
  public globalUiMap$ = new BehaviorSubject<IDictionary<boolean>>(null);
  public globalUiSettings$ = new BehaviorSubject<ICompanyUiService[]>(null);

  constructor(
    private _http: HttpClient,
    private _terms: H21TermsForUseService,
    private _permissions: PermissionService,
  ) { }

  public initCompanySetting(): Observable<CompanyProfileSetting> {
    return this._permissions.companySetting$
      .pipe(
        filter((val) => !!val),
        tap((setting) => {
          this._terms.openAgreementAccept(setting);
          this._initCompanyProfile(setting.agentofficeCompanyProfileId);
        }),
        tap((setting) => this._initSettings(setting.agentofficeCompanyProfileId)),
      );
  }

  public resetBookingsFilter({ url }): void {
    if (!url.includes('/bookings')) {
      this.bookingsFilter$.next(null);
      this.bookingsPageState$.next({});
    }
  }

  public countHotelsToView(hotelsInBatchData: IHotelsInBatch[]): number {
    return hotelsInBatchData.filter((f) => !f.isShown)
      .map((x) => x.count)
      .reduce((sum, current) => sum + current, 0);
  }

  public filterNavs(): Observable<ISidebarNavTab[]> {
    return this.uiSettings$
      .pipe(
        filter(Boolean),
        map((items) => sidebarNavTabsConst.filter((nav) => items[nav.name])),
      );
  }

  private _initCompanyProfile(id: number): void {
    this._http.get<ICompanyProfile>(`${ environment.core.profileApi }CompanyProfile/GetEntity?id=${ id }`)
      .subscribe((profile) => {
        this._initLogout(profile);
        this.company$.next(profile);
      });
  }

  private _initSettings(entityId: number): void {
    const setting$ = this._http.get<ICompanyUi>(
      `${environment.core.profileApi}CompanyInterfaceSetting/GetCurrentCompanySettings`,
    );
    setting$.subscribe((setting) => {
      this._initUiSettings(setting.settings);
      this._initGlobalUiMap(setting.services);
      this.globalUiSettings$.next(setting.services);
    });
  }

  private _initUiSettings(settings: ICompanyUiSetting[]): void {
    const filtered = settings.filter((value) => value.settingIsForSearchAndBook);
    this.uiSettings$.next(filtered.reduce((o, curr) => ({ ...o, [curr.settingCode]: curr.isShow }), {}));
  }

  private _initGlobalUiMap(services: ICompanyUiService[]): void {
    this.globalUiMap$.next(services.reduce((o, curr) => ({ ...o, [curr.serviceTypeId]: curr.isShow }), {}));
  }

  private _initLogout(profile: ICompanyProfile): void {
    const transfer = this._isServiceExists(profile, CompanyServiceTypeId.transferBookingId);
    const hotel = this._isServiceExists(profile, CompanyServiceTypeId.hotelBooking);
    this.hasNeededServices$.next(transfer || hotel);
  }

  private _isServiceExists(profile: ICompanyProfile, id: CompanyServiceTypeId): boolean {
    return !!profile.servicesActual.find((type) => type.serviceTypeId === id);
  }

}
