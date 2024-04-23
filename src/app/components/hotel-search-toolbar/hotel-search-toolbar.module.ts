import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { LayoutModule } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatSelectModule,
  MatTooltipModule,
} from '@angular/material';

// external libs
import { H21CounterModule, H21TwoMonthCalendarModule } from 'h21-be-ui-kit';

// modules
import { SharedModule } from '@shared/shared.module';

// components
import { HotelSearchToolbarComponent } from './hotel-search-toolbar.component';

@NgModule({
  declarations: [
    HotelSearchToolbarComponent,
  ],
  imports: [
    A11yModule,
    CommonModule,
    LayoutModule,
    SharedModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    H21CounterModule,
    MatDividerModule,
    MatTooltipModule,
    H21TwoMonthCalendarModule,
  ],
  exports: [
    HotelSearchToolbarComponent,
  ],
})
export class HotelSearchToolbarModule { }
