import { RouterModule, Routes } from '@angular/router';

import { TripRequestListComponent } from './components/trip-request-list/trip-request-list.component';

const routes: Routes = [
  { path: '', component: TripRequestListComponent },
];

export const routing = RouterModule.forChild(routes);
