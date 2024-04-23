import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material';

import { SupportComponent } from './support.component';
import { routing } from './support-routing.module';

@NgModule({
  declarations: [
    SupportComponent,
  ],
  imports: [
    routing,
    CommonModule,
    MatIconModule,
  ],
})
export class SupportModule { }
