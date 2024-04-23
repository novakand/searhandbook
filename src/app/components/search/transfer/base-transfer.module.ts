import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  MatSelectModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';

// external libs
import { Ng5SliderModule } from 'ng5-slider';
import { NgxMaskModule } from 'ngx-mask';

// internal libs
import { H21PipesModule, H21ProfileImageModule, LoaderService } from 'h21-be-ui-kit';

// components
import {
  TransferOrderComponent,
  TransferSearchFormComponent,
  TransferSearchResultComponent,
  TransferSearchResultFilterComponent,
  TransferSearchResultItemComponent,
} from './components';

// modules
import { BaseSearchModule } from '../base-search.module';
import { SharedModule } from '@shared/shared.module';

// pipes
import { TooltipPipe } from '@components/search/transfer/components/transfer-search-form/tooltip.pipe';
import { H21DatePipe, H21TimePipe } from '@shared/pipes';

@NgModule({
  declarations: [
    TransferOrderComponent,
    TransferSearchFormComponent,
    TransferSearchResultComponent,
    TransferSearchResultItemComponent,
    TransferSearchResultFilterComponent,
    TooltipPipe,
  ],
  imports: [
    A11yModule,
    SharedModule,
    RouterModule,
    CommonModule,
    MatMenuModule,
    H21PipesModule,
    MatChipsModule,
    MatTableModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatDialogModule,
    Ng5SliderModule,
    MatToolbarModule,
    BaseSearchModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    H21ProfileImageModule,
    NgxMaskModule.forRoot(),
  ],
  providers: [
    LoaderService,
    H21DatePipe,
    H21TimePipe,
  ],
  exports: [
    MatSelectModule,
    TransferOrderComponent,
    TransferSearchFormComponent,
    TransferSearchResultComponent,
    TransferSearchResultItemComponent,
    TransferSearchResultFilterComponent,
  ],
  entryComponents: [
    TransferOrderComponent,
    TransferSearchFormComponent,
    TransferSearchResultComponent,
    TransferSearchResultItemComponent,
    TransferSearchResultFilterComponent,
  ],
})
export class BaseTransferModule { }
