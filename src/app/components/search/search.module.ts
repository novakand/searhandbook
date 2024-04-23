import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';

// internal libs
import {
  CORE_ENVIRONMENT,
  DIALOG_PANEL_COMPONENT,
  DIALOG_PANEL_DATA,
  H21CardListLoaderModule,
  H21DialogPanelModule,
  H21InDevelopmentModule,
  H21PipesModule,
  H21ProfileImageModule,
  H21RateModule,
  H21TableLoaderModule,
  H21TwoMonthCalendarModule,
} from 'h21-be-ui-kit';
import { H21MapsModule } from 'h21-map';

// external libs
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxMaskModule } from 'ngx-mask';

// components
import {
  AirSearchFormComponent,
  EmptyTravelersListComponent,
  HistoryComponent,
  SearchComponent,
  SelectBookerDialogComponent,
  SelectTravelerDialogComponent,
  SelectTripDialogComponent,
  TrainSearchFormComponent,
  TravelersListDialogComponent,
  TripRequestDialogComponent,
} from './components';
import { SendRequestDialogComponent } from '@shared/components';
import { PaymentResultComponent } from './payment-result';

// routing
import { routing } from './search-routing.module';

// services
import { TravelerService } from '@components/search/services';

// environments
import { environment } from '@environments/environment';

// modules
import { BaseTransferModule } from '@components/search/transfer/base-transfer.module';
import { BaseHotelModule } from '@components/search/hotel/base-hotel.module';
import { BaseSearchModule } from '@components/search/base-search.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    AirSearchFormComponent,
    EmptyTravelersListComponent,
    HistoryComponent,
    SearchComponent,
    SelectBookerDialogComponent,
    SelectTravelerDialogComponent,
    TrainSearchFormComponent,
    TravelersListDialogComponent,
    TripRequestDialogComponent,
    PaymentResultComponent,
  ],
  imports: [
    A11yModule,
    routing,
    CommonModule,
    H21MapsModule,
    SharedModule,
    BaseSearchModule,
    BaseHotelModule,
    BaseTransferModule,
    H21CardListLoaderModule,
    H21DialogPanelModule,
    H21InDevelopmentModule,
    H21PipesModule,
    H21ProfileImageModule,
    H21RateModule,
    H21TableLoaderModule,
    H21TwoMonthCalendarModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatExpansionModule,
    MatMenuModule,
    MatFormFieldModule,
    MatListModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    InfiniteScrollModule,
    NgxMaskModule.forRoot(),
  ],
  providers: [
    {
      provide: DIALOG_PANEL_DATA,
      useValue: {},
    },
    {
      provide: DIALOG_PANEL_COMPONENT,
      useValue: null,
    },
    {
      provide: CORE_ENVIRONMENT,
      useValue: environment.core,
    },
    TravelerService,
  ],
  entryComponents: [
    SelectBookerDialogComponent,
    SelectTravelerDialogComponent,
    SelectTripDialogComponent,
    SendRequestDialogComponent,
    TravelersListDialogComponent,
    TripRequestDialogComponent,
  ],
})
export class SearchModule { }
