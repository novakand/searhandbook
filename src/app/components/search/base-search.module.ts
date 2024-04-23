import { MatChipsModule, MatRippleModule, MatSelectModule, MatTabsModule, MatToolbarModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// inner libs
import { H21CounterModule, H21PipesModule, H21RateModule } from 'h21-be-ui-kit';

// components
import {
  DataLoadingIndicatorComponent,
  ItemsListLoaderComponent,
  SearchFormToolbarComponent, SearchNavigationToolbarComponent,
} from './components';
import {
  PaymentComponent,
  PaymentFailedComponent,
  PaymentFailedDialogComponent,
  PaymentNotAvailableDialogComponent,
  PaymentPriceChangeDialogComponent,
  PaymentSuccessComponent,
  PaymentTimeOverDialogComponent,
} from './payment';

// services
import { SearchPaymentService } from './services';

// modules
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    PaymentComponent,
    PaymentFailedComponent,
    PaymentSuccessComponent,
    PaymentSuccessComponent,
    ItemsListLoaderComponent,
    SearchFormToolbarComponent,
    PaymentFailedDialogComponent,
    DataLoadingIndicatorComponent,
    PaymentTimeOverDialogComponent,
    SearchNavigationToolbarComponent,
    PaymentPriceChangeDialogComponent,
    PaymentNotAvailableDialogComponent,
  ],
  imports: [
    FormsModule,
    RouterModule,
    SharedModule,
    CommonModule,
    H21CounterModule,
    MatToolbarModule,
    MatChipsModule,
    MatRippleModule,
    MatSelectModule,
    MatTabsModule,
    ReactiveFormsModule,
    H21PipesModule,
    H21RateModule,
  ],
  entryComponents: [
    PaymentComponent,
    PaymentFailedComponent,
    PaymentSuccessComponent,
    PaymentSuccessComponent,
    ItemsListLoaderComponent,
    SearchFormToolbarComponent,
    PaymentFailedDialogComponent,
    DataLoadingIndicatorComponent,
    PaymentTimeOverDialogComponent,
    SearchNavigationToolbarComponent,
    PaymentPriceChangeDialogComponent,
    PaymentNotAvailableDialogComponent,
  ],
  providers: [
    SearchPaymentService,
  ],
  exports: [
    H21CounterModule,
    PaymentComponent,
    PaymentFailedComponent,
    PaymentSuccessComponent,
    PaymentSuccessComponent,
    ItemsListLoaderComponent,
    SearchFormToolbarComponent,
    PaymentFailedDialogComponent,
    DataLoadingIndicatorComponent,
    PaymentTimeOverDialogComponent,
    SearchNavigationToolbarComponent,
    PaymentPriceChangeDialogComponent,
    PaymentNotAvailableDialogComponent,
  ],
})
export class BaseSearchModule { }
