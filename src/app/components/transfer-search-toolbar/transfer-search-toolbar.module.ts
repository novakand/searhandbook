import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatSelectModule,
} from '@angular/material';

// external libs
import { H21CounterModule, H21TwoMonthCalendarModule } from 'h21-be-ui-kit';

// modules
import { SharedModule } from '@shared/shared.module';

// components
import { TransferSearchToolbarComponent } from './transfer-search-toolbar.component';

@NgModule({
  declarations: [
    TransferSearchToolbarComponent,
  ],
  imports: [
    A11yModule,
    CommonModule,
    SharedModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatDividerModule,
    H21CounterModule,
    H21TwoMonthCalendarModule,
  ],
  exports: [
    TransferSearchToolbarComponent,
  ],
})
export class TransferSearchToolbarModule { }
