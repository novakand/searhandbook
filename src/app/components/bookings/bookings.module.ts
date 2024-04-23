import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule,
} from '@angular/material';

// modules
import { SharedModule } from '@shared/shared.module';

// internal libraries
import {
  DIALOG_PANEL_COMPONENT,
  DIALOG_PANEL_DATA,
  H21BookingSharedModule,
  H21CardLoaderModule,
  H21DialogPanelModule,
  H21HistoryModule,
  H21PipesModule,
  H21ProfileImageModule,
  H21RateModule,
  H21TableLoaderModule,
} from 'h21-be-ui-kit';

// external libraries
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

// components
import {
  BookingsCancellationPolicyComponent,
  BookingsCustomerComponent,
  BookingsDetailsComponent,
  BookingsFilterComponent,
  BookingsListComponent,
  BookingsListOrdersComponent,
  BookingsListTripsComponent,
  BookingsOrderComponent,
  BookingsOrderDocumentsComponent,
  BookingsOrderHotelDetailsComponent,
  BookingsOrderInfoComponent,
  BookingsOrderPaymentInfoComponent,
  BookingsOrderTransferDetailsComponent,
  BookingsOrderTravelersComponent,
  BookingsSendEmailComponent,
  BookingsTransferDetailsComponent,
  BookingsTravelersListComponent,
  BookingsTripCardComponent,
  BookingsTripEditDialogComponent,
} from './components';
import { SendRequestDialogComponent } from '@shared/components';

// routing
import { routing } from './bookings-routing.module';

// services
import { BookingReportService, BookingsService } from './services';
import { BookingsListService } from './components/bookings-list/bookings-list.service';

// environment
import { environment } from '@environments/environment';
import { SelectTripDialogComponent } from '@components/search/components';

@NgModule({
  declarations: [
    BookingsListComponent,
    BookingsOrderComponent,
    BookingsFilterComponent,
    BookingsDetailsComponent,
    BookingsCustomerComponent,
    BookingsTripCardComponent,
    BookingsListTripsComponent,
    BookingsSendEmailComponent,
    BookingsListOrdersComponent,
    BookingsTravelersListComponent,
    BookingsOrderTravelersComponent,
    BookingsTripEditDialogComponent,
    BookingsTransferDetailsComponent,
    BookingsOrderHotelDetailsComponent,
    BookingsCancellationPolicyComponent,
    BookingsOrderTransferDetailsComponent,
    BookingsOrderInfoComponent,
    BookingsOrderDocumentsComponent,
    BookingsOrderPaymentInfoComponent,
  ],
  imports: [
    routing,
    A11yModule,
    SharedModule,
    CommonModule,
    H21CardLoaderModule,
    H21DialogPanelModule,
    H21PipesModule,
    H21ProfileImageModule,
    H21RateModule,
    H21TableLoaderModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatTabsModule,
    MatCardModule,
    MatMenuModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    H21HistoryModule.forRoot(`${environment.core.apiRootUrl}OrderEntityHistory/`),
    ScrollToModule.forRoot(),
    SharedModule,
    H21BookingSharedModule,
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
    BookingsService,
    BookingReportService,
    BookingsListService,
  ],
  entryComponents: [
    BookingsFilterComponent,
    BookingsSendEmailComponent,
    BookingsTripEditDialogComponent,
    SendRequestDialogComponent,
    SelectTripDialogComponent,
  ],
})
export class BookingsModule { }
