import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ITripRequestListItem } from '../../interfaces';

@Component({
  selector: 'h21-trip-request-dialog',
  templateUrl: './trip-request-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRequestDialogComponent implements OnInit {

  public form: FormGroup;
  public data: ITripRequestListItem;
  public formFieldAppearance: string;

  constructor(public dialogRef: MatDialogRef<TripRequestDialogComponent>,
              private _fb: FormBuilder,
              private _cdr: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) private _data: ITripRequestListItem,
  ) {
    this.data = this._data;
    this.formFieldAppearance = 'outline';
  }

  public ngOnInit() {
    this._buildForm();
  }

  public save(): void {
    // save action
    this.dialogRef.close(true);
  }

  public close(): void {
    this.dialogRef.close(false);
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      name: new FormControl(this.data.name, Validators.required),
    });
  }

}
