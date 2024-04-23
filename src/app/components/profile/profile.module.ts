import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  MatCardModule, MatDatepickerModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule, MatSelectModule,
} from '@angular/material';

import { H21ProfileImageModule } from 'h21-be-ui-kit';

import { ProfileComponent } from './profile.component';

// modules
import { SharedModule } from '@app/shared/shared.module';
import { routing } from './profile-routing.module';

@NgModule({
  declarations: [
    ProfileComponent,
  ],
  imports: [
    routing,
    SharedModule,
    CommonModule,
    MatCardModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    H21ProfileImageModule,
    MatProgressBarModule,
    MatInputModule,
  ],
})
export class ProfileModule { }
