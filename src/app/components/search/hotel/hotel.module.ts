import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import {
  MatAutocompleteModule,
  MatButtonToggleModule,
  MatCardModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatMenuModule,
  MatOptionModule,
  MatProgressBarModule,
  MatRadioModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

// modules
import { BaseHotelModule } from './base-hotel.module';
import { BaseSearchModule } from '../base-search.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    A11yModule,
    SharedModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatRadioModule,
    BaseHotelModule,
    MatDialogModule,
    MatOptionModule,
    MatSliderModule,
    MatToolbarModule,
    MatTooltipModule,
    BaseSearchModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
  ],
})
export class HotelModule { }
