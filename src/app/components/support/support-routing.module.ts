import { RouterModule, Routes } from '@angular/router';

import { SupportComponent } from './support.component';

const routes: Routes = [
  { path: '', component: SupportComponent },
];

export const routing = RouterModule.forChild(routes);
