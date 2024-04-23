import { RouterModule, Routes } from '@angular/router';

// inner libs
import { H21InDevelopmentComponent } from 'h21-be-ui-kit';

// components
import {
  HistoryComponent,
  HotelCardComponent,
  HotelOrderComponent,
  HotelSearchResultComponent,
  SearchComponent,
  TransferOrderComponent,
  TransferSearchResultComponent,
} from './components';
import { PaymentComponent } from './payment';
import { PaymentResultComponent } from './payment-result';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'hotel',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SearchComponent,
    children: [
      {
        path: 'air',
        data: { sidenav: 'airSearch', sidenavContent: 'map' },
      },
      {
        path: 'air/result',
        component: H21InDevelopmentComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'hotel',
        data: { sidenav: 'hotelSearch', sidenavContent: 'map' },
      },
      {
        path: 'hotel/result',
        component: HotelSearchResultComponent,
        data: { sidenav: 'hotelFilter', sidenavContent: 'outlet' },
      },
      {
        path: 'hotel/order',
        component: HotelOrderComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'hotel/payment-result',
        component: PaymentResultComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'hotel/payment',
        component: PaymentComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'hotel/card',
        component: HotelCardComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },

      {
        path: 'train',
        data: { sidenav: 'trainSearch', sidenavContent: 'map' },
      },
      {
        path: 'train/result',
        component: H21InDevelopmentComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'transfer',
        data: { sidenav: 'transferSearch', sidenavContent: 'map' },
      },
      {
        path: 'transfer/result',
        component: TransferSearchResultComponent,
        data: { sidenav: 'transferFilter', sidenavContent: 'outlet' },
      },
      {
        path: 'transfer/order',
        component: TransferOrderComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'transfer/payment-result',
        component: PaymentResultComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'transfer/payment',
        component: PaymentComponent,
        data: { sidenav: 'none', sidenavContent: 'outlet' },
      },
      {
        path: 'history',
        component: HistoryComponent,
        data: { sidenav: 'history', sidenavContent: 'map' },
      },
      {
        path: 'train',
        data: { sidenav: 'search', sidenavContent: 'map' },
      },
      {
        path: 'train/result',
        component: H21InDevelopmentComponent,
        data: { sidenav: 'filter', sidenavContent: 'outlet' },
      },
      {
        path: 'favorites',
        data: { sidenav: 'favorites', sidenavContent: 'map' },
      },
      {
        path: 'poi',
        data: { sidenav: 'poi', sidenavContent: 'map' },
      },
    ],
  },
  { path: '**', redirectTo: 'hotel' },
];
export const routing = RouterModule.forChild(routes);
