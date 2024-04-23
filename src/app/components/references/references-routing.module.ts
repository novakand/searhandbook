import { RouterModule, Routes } from '@angular/router';

import { ReferencesComponent } from './components';

const routes: Routes = [
  { path: '', component: ReferencesComponent },
];

export const routing = RouterModule.forChild(routes);
