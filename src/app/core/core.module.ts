import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, RendererFactory2, SkipSelf } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Platform } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';

// external libs
import { AppInsightsService } from '@markpieszak/ng-application-insights';
import { OAuthService } from 'angular-oauth2-oidc';

// inner libs
import {
  AppSubscriberService,
  CompanySettingService,
  CORE_ENVIRONMENT,
  DateService,
  FreshChatModule,
  H21_DATE_FORMATS,
  H21AccessDeniedModule,
  H21AppInsightInterceptor,
  H21CompanySelectPanelModule,
  H21DateAdapter,
  H21DefaultDialogService,
  H21ErrorInterceptor,
  H21InDevelopmentModule,
  H21NotificationListDialogService,
  H21TermsForUseDialogModule,
  H21TermsForUseService,
  H21TopToolbarModule,
  H21WhiteLabelModule,
  PermissionService,
  REDIRECT_URI
} from 'h21-be-ui-kit';

// components

// environment
import { environment } from '@environments/environment';

// modules
import { SharedModule } from '@shared/shared.module';

// services
import {
  CompanyReferenceService,
  HistorySearchService,
  ReportService,
} from '@core/services';
import { TransferService } from '@components/search/transfer/services';
import { ShareSearchRequestService } from '@hotel/services';

@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    HttpClientModule,
    FreshChatModule,
    H21AccessDeniedModule,
    H21CompanySelectPanelModule,
    H21TopToolbarModule,
    H21InDevelopmentModule,
    H21WhiteLabelModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    H21TermsForUseDialogModule,
    FreshChatModule.forRoot(environment.freshChat),
  ],
  exports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
  ],
  providers: [
    TransferService,
    AppSubscriberService,
    CompanyReferenceService,
    ShareSearchRequestService,
    H21NotificationListDialogService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: H21AppInsightInterceptor,
      multi: true,
      deps: [AppInsightsService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: H21ErrorInterceptor,
      multi: true,
      deps: [Router, OAuthService, H21DefaultDialogService ],
    },
    {
      provide: DateAdapter,
      useClass: H21DateAdapter,
      deps: [MAT_DATE_LOCALE, Platform],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: H21_DATE_FORMATS,
    },
    AppInsightsService,
    {
      provide: DateService,
      useClass: DateService,
      deps: [DateAdapter],
    },
    {
      provide: REDIRECT_URI,
      useValue: environment.auth.redirectUri,
    },
    {
      provide: CORE_ENVIRONMENT,
      useValue: environment.core,
    },
    CompanySettingService,
    {
      provide: ReportService,
      useClass: ReportService,
      deps: [HttpClient, RendererFactory2],
    },
    {
      provide: HistorySearchService,
      useClass: HistorySearchService,
      deps: [HttpClient, ActivatedRoute, ShareSearchRequestService],
    },
    {
      provide: 'window',
      useValue: window,
    },
  ],
})
export class CoreModule {

  constructor(@Optional() @SkipSelf() parentModule: CoreModule,
              private appInsightsService: AppInsightsService) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded');
    }

    appInsightsService.config = environment.appInsightsConfig;
    appInsightsService.init();
  }

}
