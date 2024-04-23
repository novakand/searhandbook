import { NgModule } from '@angular/core';

import { BASE_URL, DIALOG_PANEL_DATA, SubsidiaryModule } from 'h21-be-ui-kit';

// environment
import { environment } from '@environments/environment';

@NgModule({
  imports: [
    SubsidiaryModule,
  ],
  providers: [
    {
      provide: BASE_URL,
      useValue: `${environment.core.profileApi}EntityHistory/`,
    },
    {
      provide: DIALOG_PANEL_DATA,
      useValue: {},
    },
  ],
})
export class SubsidiaryWrapperModule { }
