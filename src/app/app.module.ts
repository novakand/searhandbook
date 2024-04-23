import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';

// external libs
import { ApplicationInsightsModule } from '@markpieszak/ng-application-insights';
import { OAuthService } from 'angular-oauth2-oidc';
import { CookieModule } from 'ngx-cookie';

// inner libs
import {
  COMPANY_PROFILE_CLAIM,
  CompanySettingService,
  CORE_ENVIRONMENT,
  H21BreadcrumbsModule,
  H21HeaderModule,
  H21SidebarNavModule,
  SettingsService,
  SignalrService,
} from 'h21-be-ui-kit';

// components
import { AppComponent } from '@components/app/app.component';

// modules
import { CoreModule } from '@app/core/core.module';
import { HotelSearchToolbarModule } from '@components/hotel-search-toolbar/hotel-search-toolbar.module';
import { TransferSearchToolbarModule } from '@components/transfer-search-toolbar/transfer-search-toolbar.module';
import { MatMenuModule } from '@angular/material';

// routes
import { routing } from '@app/app.routing';

// environment
import { environment } from '@environments/environment';

// services
import { NotificationSignalRService } from '@core/services/notification-signalr.service';

// models
import { CompanyProfileClaim } from '@models/company-profile-claim.model';

export function claimFactory(auth: OAuthService) {
  return new CompanyProfileClaim(auth);
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  providers: [
    {
      provide: COMPANY_PROFILE_CLAIM,
      useFactory: claimFactory,
      deps: [OAuthService],
    },
    {
      provide: SignalrService,
      useClass: SignalrService,
      deps: [SettingsService],
    },
    {
      provide: NotificationSignalRService,
      useClass: NotificationSignalRService,
      deps: [SignalrService],
    },
    {
      provide: CompanySettingService,
      useClass: CompanySettingService,
      deps: [HttpClient, OAuthService, SettingsService, CORE_ENVIRONMENT],
    },
  ],
  imports: [
    routing,
    CoreModule,
    BrowserModule,
    BrowserAnimationsModule,
    CookieModule.forRoot(),
    HotelSearchToolbarModule,
    MatMenuModule,
    H21SidebarNavModule,
    H21BreadcrumbsModule,
    H21HeaderModule.forRoot(environment.auth),
    TransferSearchToolbarModule,
    ApplicationInsightsModule.forRoot({
      instrumentationKeySetLater: true, // <--
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
