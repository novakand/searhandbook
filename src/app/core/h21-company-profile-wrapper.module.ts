import { NgModule } from '@angular/core';

import {
  BASE_URL,
  CompanyProfileModule,
  DIALOG_PANEL_COMPONENT,
  DIALOG_PANEL_DATA,
} from 'h21-be-ui-kit';

// environment
import { environment } from '@environments/environment';

@NgModule({
  imports: [
    CompanyProfileModule,
  ],
  providers: [
    {
      provide: BASE_URL,
      useValue: `${environment.core.profileApi}EntityHistory/`,
    },
    {
      provide: DIALOG_PANEL_COMPONENT,
      useValue: null,
    },
    {
      provide: DIALOG_PANEL_DATA,
      useValue: {},
    },
  ],
})
export class H21CompanyProfileWrapperModule { }
