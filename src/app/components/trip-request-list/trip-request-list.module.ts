import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatTableModule,
} from '@angular/material';

import {
  DIALOG_PANEL_COMPONENT,
  DIALOG_PANEL_DATA,
  H21DialogPanelModule,
  H21TableLoaderModule
} from 'h21-be-ui-kit';

import { routing } from './trip-request-list-routing.module';
import { SharedModule } from '@shared/shared.module';

import {
  TripRequestDialogComponent,
  TripRequestFilterComponent,
  TripRequestListComponent,
} from './components';


@NgModule({
  declarations: [
    TripRequestDialogComponent,
    TripRequestFilterComponent,
    TripRequestListComponent,
  ],
  imports: [
    A11yModule,
    routing,
    CommonModule,
    SharedModule,
    H21DialogPanelModule,
    H21TableLoaderModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
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
  ],
  entryComponents: [
    TripRequestDialogComponent,
    TripRequestFilterComponent,
  ],
})

export class TripRequestListModule { }
