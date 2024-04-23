import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import {
  MatAutocompleteModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatMenuModule,
  MatOptionModule,
  MatRadioModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';

// modules
import { BaseTransferModule } from './base-transfer.module';
import { BaseSearchModule } from '../base-search.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    A11yModule,
    SharedModule,
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatChipsModule,
    MatTableModule,
    MatRadioModule,
    MatDialogModule,
    MatOptionModule,
    MatToolbarModule,
    BaseSearchModule,
    MatExpansionModule,
    BaseTransferModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
  ],
})
export class TransferModule { }
