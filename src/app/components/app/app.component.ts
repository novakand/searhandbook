import { AfterContentChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

// external libs
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { combineLatest, Subject } from 'rxjs';
import cssVars from 'css-vars-ponyfill';

// interfaces
import { IToolbarAction } from '@core/interfaces/toolbar-action.interface';
import { ICompanyUiSetting, INotify } from '@core/interfaces';

// services
import { NotificationSignalRService } from '@core/services/notification-signalr.service';
import { BreadCrumbsService } from '@services/bread-crumbs.service';
import { SearchSidenavService } from '@search/components';
import { StorageService } from '@core/services';

// inner libs
import {
  DateService,
  FreshChatService,
  H21DateTimePatternTypes,
  H21ThemeService,
  H21WhiteLabelRef,
  H21WhiteLabelService,
  IBreadcrumb, IDictionary,
  IH21Notification,
  IIdentityClaims,
  ISidebarNavTab,
  IUserCardAction,
  LoadProgressService,
  PermissionService,
  ToolbarActionsService,
  UserProfileService,
  ViewMode,
} from 'h21-be-ui-kit';

// data
import { userCardActionsConst } from './constatns';

// environment
import { environment } from '@environments/environment';

// utils
import { AppUtils } from '@components/app/app.utils';

@Component({
  selector: 'h21-app-root',
  templateUrl: './app.component.html',
  viewProviders: [MatIconRegistry],
})
export class AppComponent implements OnInit, OnDestroy, AfterContentChecked {

  public logoUrl = './assets/img/logo.svg';
  public notificationCount = 0;

  public tabletMode: boolean;
  public hasValidTokens: boolean;
  public viewModeType = ViewMode;
  public sidebarNavViewMode = ViewMode.Collapsed;
  public sidebarNavActiveTab: string;
  public sidebarNavDisabled: boolean;
  public sidebarNavTabs: ISidebarNavTab[] = [];
  public breadcrumbs: IBreadcrumb[] = [];

  public isChatVisible$ = this._storage.uiSettings$
    .pipe(
      filter(Boolean),
      map((uiSettings) => uiSettings.supportChat),
    );

  public chatLoaded$ = this._chat.loaded$.pipe(map(() => true));

  public isShow$ = combineLatest(
    this._permissions.loaded$,
    this._storage.initCompanySetting(),
  )
  .pipe(
    switchMap(() =>
      this._storage.hasNeededServices$.pipe(filter((item) => item !== null)),
    ),
    tap((isShow) => !isShow && this._auth.logOut()),
  );

  public showSearchHotelToolbar: boolean;
  public showSearchTransferToolbar: boolean;
  public showBackToSearch: boolean;
  public showBackToSearchResult: boolean;

  public claims: IIdentityClaims;
  public actions: IUserCardAction[];
  public notifications: IH21Notification[] = [];
  public toolbarActions$;
  public showProgress: boolean;

  private _destroy$ = new Subject<boolean>();
  private _whiteLabelDialogRef: H21WhiteLabelRef;

  constructor(private _router: Router,
              private _auth: OAuthService,
              private _theme: H21ThemeService,
              private _cdr: ChangeDetectorRef,
              private _chat: FreshChatService,
              private _storage: StorageService,
              private _dateService: DateService,
              private _domSanitizer: DomSanitizer,
              public userService: UserProfileService,
              private _permissions: PermissionService,
              private _matIconRegistry: MatIconRegistry,
              private _signal: NotificationSignalRService,
              public sidenavService: SearchSidenavService,
              private _whiteLabelDialog: H21WhiteLabelService,
              private _breadCrumbsService: BreadCrumbsService,
              private _breakpointObserver: BreakpointObserver,
              private _loadProgressService: LoadProgressService,
              private _toolbarActionsService: ToolbarActionsService,
  ) {
    this._checkToken();

    // для получения context.connectionId в любом случае
    this._signal.contextResolved.pipe(takeUntil(this._destroy$))
      .subscribe(() => this._onNotification());

    const resource = this._domSanitizer.bypassSecurityTrustResourceUrl('./assets/h21icons.svg');
    this._matIconRegistry.addSvgIconSet(resource);

    this._loadProgressService.inProgress
      .subscribe((progress: boolean) => {
        this.showProgress = progress;
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      });

    this._router.events.pipe(takeUntil(this._destroy$))
      .subscribe(($event: any) => this._onRouteChanged($event));

    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        if (this.tabletMode) {
          this.sidebarNavViewMode = ViewMode.Collapsed;
        }
        this._cdr.markForCheck();
      });
  }

  public ngOnInit(): void {
    AppUtils.fixIEStyles();
  }

  public ngAfterContentChecked(): void {
    this.toolbarActions$ = this._toolbarActionsService.actions$;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();

    this._chat.destroy();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public initFreshChat(claims: IIdentityClaims): void {
    this._chat.downloaded$.subscribe({
      next: () => {
        this._chat.init({
          host: environment.freshChat.host,
          token: environment.freshChat.token,
          externalId: claims.email,
        });

        this._chat.setConfig({
          headerProperty: {
            hideChatButton: true,
          },
        });

        this._chat.setUser({
          firstName: claims.given_name,
          lastName: claims.middle_name,
        });
      },
    });
  }

  public openChat(): void { this._chat.open(); }

  public toggleSidebarNavViewMode(): void {
    if (this.tabletMode) {
      this.sidenavService.opened$.next(!this.sidenavService.opened$.value);
      this._cdr.detectChanges();
    } else {
      this.sidebarNavViewMode = this.sidebarNavViewMode === ViewMode.Collapsed
        ? ViewMode.Expanded
        : ViewMode.Collapsed;
    }
  }

  public onAction(action: string): void {
    (action === 'whiteLabel') && this.openWhiteLabelDialog();
    this.openDashboard(action);
  }

  public openDashboard(name: string): void {
    name === 'dashboard' && window.open(environment.core.dashboardUrlUri, '_blank');
  }

  public openWhiteLabelDialog(): void {
    this._whiteLabelDialogRef = this._whiteLabelDialog.open();
  }

  public onActivateRouterOutlet(): void {
    this._toolbarActionsService.actions$.next([]);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public toolbarActionClick(e: IToolbarAction): void {
    e.action && e.action();
  }

  public resetNotifications() {
    this.notifications.forEach((element) => {
      element.isUnread = false;
      element.icon = 'notifications_none';
    });
    this.notificationCount = 0;
  }

  public backToSearch(): void {
    const regExp = /^\/?search\/(transfer|hotel)\/result.*$/i;
    const found = this._router.url.match(regExp);
    if (found !== null) {
      this._router.navigate([`search/${found[1]}`], { queryParams: { isRestore: true } });
      found[1] === 'hotel' && this._signal.searchResult$.next(null);
    }
  }

  public backToSearchResult(): void {
    const regExp = /^\/?search\/(transfer|hotel)\/order.*$/i;
    const found = this._router.url.match(regExp);
    found !== null && this._router.navigate([`search/${found[1]}/result`], { queryParams: { isBack: true } });
  }

  private _setActiveTab(): void {
    if (!this.sidebarNavTabs.length) { return; }
    this.sidebarNavActiveTab = AppUtils.getActiveTab(this._router, this.sidebarNavTabs);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _checkToken(): void {
    const hasValidTokens = this._auth.hasValidIdToken() && this._auth.hasValidAccessToken();

    if (!hasValidTokens) {
      const redirectUrl = `${window.location.pathname}${window.location.search}`;
      const additionalState = encodeURIComponent(this._auth.state || redirectUrl);
      this._auth.initImplicitFlow(additionalState);
      return;
    }

    this._theme.themeLoaded.subscribe(() => {
      this.initFreshChat(this.claims);
      this._chat.load();
      this._onPermissionsLoaded();
    });

    this._auth.loadUserProfile()
    .then((user) => {
      this._permissions.init();
      this.userService.getUser();
      this.claims = <IIdentityClaims>user;
      this._signal.setUser(this.claims.email);
      this._theme.applyTheme();
    });
  }

  private _onNotification() {
    this._signal.notify$
    .pipe(takeUntil(this._destroy$))
    .subscribe({
      next: (item: INotify) => {
        const it: IH21Notification = {
          text: item.message,
          isUnread: true,
          dateTimeSplitter: ' ',
          icon: 'notifications_active',
          createDate: this._dateService.getDateByPattern(new Date(), H21DateTimePatternTypes.H21_SHORT_MONTH),
        };
        this.notifications.unshift(it);
        this.notificationCount = this.notifications.filter((n) => n.isUnread).length;
      },
    });
  }

  private _onRouteChanged($event: any): void {
    if ($event instanceof NavigationStart) {
      if (this._loadProgressService.inProgress) {
        this._loadProgressService.hide(9999);
      }
      this._loadProgressService.show();
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }
    if ($event instanceof NavigationEnd) {
      this._storage.resetBookingsFilter($event);
      this._setActiveTab();
      this._showSearchControls();
      this._loadProgressService.hide();
      this._breadCrumbsService.fillBreadCrumbs(this._router.url, this.breadcrumbs);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }
  }

  private _showSearchControls(): void {
    this.showSearchHotelToolbar = this._router.url.indexOf('search/hotel/result') >= 0 || this._router.url.includes('search/hotel/card');
    this.showSearchTransferToolbar = this._router.url.indexOf('search/transfer/result') >= 0;
    this.showBackToSearch = /^\/?search\/(transfer|hotel)\/result.*$/ig.test(this._router.url);
    this.showBackToSearchResult = /^\/?search\/(transfer|hotel)\/order.*$/ig.test(this._router.url);
  }

  private _getUserCardActions(): void {
    this.actions = userCardActionsConst;
    this.actions[1].visibility = this._permissions.hasPermissions(this.actions[1].label);
    const isCompanyProfileVisible$ = this._storage.uiSettings$.pipe(filter(Boolean));
    isCompanyProfileVisible$.subscribe((uiSettings) => {
      this._setVisibleBySetting(uiSettings, 0);
      this._setVisibleBySetting(uiSettings, 3);
    });
  }

  private _setVisibleBySetting(uiSettings: IDictionary<boolean>, idx: number): void {
    const visible = uiSettings[userCardActionsConst[idx].name];
    this.actions[idx].visibility = this._permissions.hasPermissions(this.actions[idx].label) && visible;
  }

  private _getSidebarNavTabs(): void {
    this._storage.filterNavs().subscribe((navs) => {
      this.sidebarNavTabs = navs;
      this.sidebarNavTabs.forEach((item) => {
        item.disabled = item.disabled || !this._permissions.hasPermissions(item.label);
      });
      this._setActiveTab();
    });
  }

  private _onPermissionsLoaded(): void {
    this._permissions.loaded$
      .pipe(filter((loaded) => !!loaded))
      .subscribe(() => {
        this._getUserCardActions();
        this._getSidebarNavTabs();
        this.hasValidTokens = true;
        (this._auth.state && this._auth.state !== '/') && this._router.navigateByUrl(this._auth.state);
      });
  }

}
