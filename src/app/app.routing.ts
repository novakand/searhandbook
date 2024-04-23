import { RouterModule, Routes } from '@angular/router';

import {
  H21AccessDeniedComponent,
  H21ErrorPageComponent,
  H21InDevelopmentComponent,
} from 'h21-be-ui-kit';

// guards
import { CompanyProfileDeactivateGuard, RolesGuard } from '@core/guards';

const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'profile', loadChildren: 'app/components/profile/profile.module#ProfileModule', canLoad: [RolesGuard] },
  { path: 'support', loadChildren: 'app/components/support/support.module#SupportModule', canLoad: [RolesGuard] },
  { path: 'access-denied', component: H21AccessDeniedComponent, canLoad: [RolesGuard] },
  { path: 'development', component: H21InDevelopmentComponent, canLoad: [RolesGuard] },
  { path: 'error', component: H21ErrorPageComponent, canLoad: [RolesGuard] },
  { path: 'search', loadChildren: 'app/components/search/search.module#SearchModule', canLoad: [RolesGuard] },
  {
    path: 'trip_request',
    loadChildren: 'app/components/trip-request-list/trip-request-list.module#TripRequestListModule',
    canLoad: [RolesGuard],
  },
  {
    path: 'company-profile',
    loadChildren: './core/h21-company-profile-wrapper.module#H21CompanyProfileWrapperModule',
    canLoad: [RolesGuard],
    canDeactivate: [CompanyProfileDeactivateGuard],
  },
  { path: 'subsidiary', loadChildren: './core/h21-subsidiary-wrapper.module#SubsidiaryWrapperModule', canLoad: [RolesGuard] },
  { path: 'references', loadChildren: 'app/components/references/references.module#ReferencesModule', canLoad: [RolesGuard] },
  { path: 'bookings', loadChildren: 'app/components/bookings/bookings.module#BookingsModule', canLoad: [RolesGuard] },
  { path: '**', redirectTo: '/' },
];

export const routing = RouterModule.forRoot(routes);
