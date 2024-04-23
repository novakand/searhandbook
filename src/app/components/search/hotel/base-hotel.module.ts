import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

// external libs
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GalleryModule } from '@ngx-gallery/core';
import { Ng5SliderModule } from 'ng5-slider';
import { NgxMaskModule } from 'ngx-mask';

// internal libs
import {
  H21InDevelopmentModule,
  H21PipesModule,
  H21ProfileImageModule,
  H21RateModule,
  H21TwoMonthCalendarModule,
  LoaderService,
} from 'h21-be-ui-kit';
import { H21MapsModule } from 'h21-map';

// services
import {
  HotelGeneralInfoService,
  SetSearchService,
  ShareSearchRequestService
} from '@components/search/hotel/services';

// components
import {
  HotelCardComponent,
  HotelDetailsComponent,
  HotelFavoritesComponent,
  HotelInfoComponent,
  HotelLocationComponent,
  HotelOrderCalendarComponent,
  HotelOrderComponent,
  HotelPhotosComponent,
  HotelPoiComponent,
  HotelPoiDialogComponent,
  HotelRoomsListComponent,
  HotelRoomsListItemComponent,
  HotelSearchFormComponent,
  HotelSearchResultComponent,
  HotelSearchResultFilterComponent,
  HotelSearchResultFilterToolbarComponent,
  HotelSearchResultItemComponent,
  HotelSearchResultMapDialogComponent,
  HotelSearchResultUpdateNotificationComponent,
} from './components';

// modules
import { BaseSearchModule } from '../base-search.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    HotelPoiComponent,
    HotelCardComponent,
    HotelInfoComponent,
    HotelOrderComponent,
    HotelPhotosComponent,
    HotelDetailsComponent,
    HotelLocationComponent,
    HotelPoiDialogComponent,
    HotelFavoritesComponent,
    HotelRoomsListComponent,
    HotelSearchFormComponent,
    HotelSearchResultComponent,
    HotelOrderCalendarComponent,
    HotelRoomsListItemComponent,
    HotelSearchResultItemComponent,
    HotelSearchResultFilterComponent,
    HotelSearchResultMapDialogComponent,
    HotelSearchResultFilterToolbarComponent,
    HotelSearchResultUpdateNotificationComponent,
  ],
  imports: [
    A11yModule,
    SharedModule,
    H21PipesModule,
    RouterModule,
    CommonModule,
    H21MapsModule,
    GalleryModule,
    H21RateModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatRadioModule,
    LightboxModule,
    MatOptionModule,
    MatSelectModule,
    MatDialogModule,
    Ng5SliderModule,
    MatToolbarModule,
    MatTooltipModule,
    BaseSearchModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatDatepickerModule,
    InfiniteScrollModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    H21ProfileImageModule,
    H21InDevelopmentModule,
    NgxMaskModule.forRoot(),
    H21TwoMonthCalendarModule,
  ],
  providers: [
    LoaderService,
    SetSearchService,
    HotelGeneralInfoService,
    ShareSearchRequestService,
  ],
  exports: [
    HotelPoiComponent,
    HotelCardComponent,
    HotelInfoComponent,
    HotelOrderComponent,
    HotelPhotosComponent,
    HotelDetailsComponent,
    HotelLocationComponent,
    HotelPoiDialogComponent,
    HotelFavoritesComponent,
    HotelRoomsListComponent,
    HotelSearchFormComponent,
    HotelSearchResultComponent,
    HotelOrderCalendarComponent,
    HotelRoomsListItemComponent,
    HotelSearchResultItemComponent,
    HotelSearchResultFilterComponent,
    HotelSearchResultMapDialogComponent,
    HotelSearchResultFilterToolbarComponent,
    HotelSearchResultUpdateNotificationComponent,
  ],
  entryComponents: [
    HotelPoiComponent,
    HotelCardComponent,
    HotelInfoComponent,
    HotelOrderComponent,
    HotelPhotosComponent,
    HotelDetailsComponent,
    HotelLocationComponent,
    HotelPoiDialogComponent,
    HotelFavoritesComponent,
    HotelRoomsListComponent,
    HotelSearchFormComponent,
    HotelSearchResultComponent,
    HotelOrderCalendarComponent,
    HotelRoomsListItemComponent,
    HotelSearchResultItemComponent,
    HotelSearchResultFilterComponent,
    HotelSearchResultMapDialogComponent,
    HotelSearchResultFilterToolbarComponent,
    HotelSearchResultUpdateNotificationComponent,
  ],
})
export class BaseHotelModule { }
