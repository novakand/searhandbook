import {
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatTooltipModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// external libs
import { OAuthResourceServerErrorHandler, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';

// inner libs
import {
  H21AuthInterceptor, H21CardListLoaderModule,
  H21ColumnsSelectModule,
  H21DirectivesModule,
  H21ErrorPageModule,
  SettingsService,
} from 'h21-be-ui-kit';

// pipes
import {
  GetCompanyNameTextPipe,
  GetCompanyNameTooltipTextPipe,
  H21CardFormat,
  H21DatePipe,
  H21DateTransformPipe,
  H21NumberFormatPipe,
  H21StringToDatePipe,
  H21TimePipe,
  SafeHtmlPipe,
  SizePipe
} from '@shared/pipes';

// environment
import { environment } from '@environments/environment';

// components
import { FailedComponent, SendRequestDialogComponent, ThreeLinePreloaderComponent } from './components';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { SelectTripDialogComponent } from '@components/search/components';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    FailedComponent,
    SelectTripDialogComponent,
    SendRequestDialogComponent,
    ThreeLinePreloaderComponent,
    H21TimePipe,
    H21DatePipe,
    H21StringToDatePipe,
    H21DateTransformPipe,
    H21NumberFormatPipe,
    SafeHtmlPipe,
    SizePipe,
    H21CardFormat,
    GetCompanyNameTextPipe,
    GetCompanyNameTooltipTextPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    H21ErrorPageModule,
    H21DirectivesModule,
    ReactiveFormsModule,
    H21ColumnsSelectModule,
    MatProgressBarModule,
    MatListModule,
    MatCardModule,
    H21CardListLoaderModule,
  ],
  providers: [
    SettingsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: H21AuthInterceptor,
      deps: [OAuthStorage, SettingsService, OAuthService, OAuthResourceServerErrorHandler],
      multi: true,
    },
  ],
  exports: [
    FailedComponent,
    SendRequestDialogComponent,
    ThreeLinePreloaderComponent,
    H21TimePipe,
    H21DatePipe,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatCheckboxModule,
    H21ErrorPageModule,
    ReactiveFormsModule,
    H21StringToDatePipe,
    H21DirectivesModule,
    H21DateTransformPipe,
    H21NumberFormatPipe,
    SafeHtmlPipe,
    SizePipe,
    H21CardFormat,
    GetCompanyNameTextPipe,
    GetCompanyNameTooltipTextPipe,
  ],
})
export class SharedModule {

  constructor(private settings: SettingsService) {
    settings.setEnvironment(environment.core);
  }

}
