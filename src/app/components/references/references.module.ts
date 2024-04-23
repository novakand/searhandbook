import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
} from '@angular/material';

import { routing } from './references-routing.module';
import { SharedModule } from '@shared/shared.module';

import { ReferencesComponent } from './components';

@NgModule({
  declarations: [
    ReferencesComponent,
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})

export class ReferencesModule { }
