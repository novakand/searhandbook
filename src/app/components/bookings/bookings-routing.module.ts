import { RouterModule, Routes } from '@angular/router';

// components
import {
  BookingsDetailsComponent,
  BookingsListComponent,
  BookingsOrderComponent,
  BookingsTripCardComponent,
} from './components';

const routes: Routes = [
  { path: '', component: BookingsListComponent },
  { path: 'order/:id', component: BookingsOrderComponent },
  // { path: 'details/:id', component: BookingsDetailsComponent },
  { path: 'trip/:id', component: BookingsTripCardComponent },
];

export const routing = RouterModule.forChild(routes);
