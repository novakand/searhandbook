import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// interfaces
import { IBookingListTrip } from '../../interfaces';

@Component({
  selector: 'h21-bookings-trip-edit-dialog',
  templateUrl: './bookings-trip-edit-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsTripEditDialogComponent implements OnInit {

  public form: FormGroup;
  public data: any;
  public formFieldAppearance: string;

  constructor(
    public dialogRef: MatDialogRef<BookingsTripEditDialogComponent>,
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private _data: IBookingListTrip,
  ) {
    this.data = this._data;
    this.formFieldAppearance = 'outline';
  }

  public ngOnInit() {
    this._buildForm();
  }

  public save(): void {
    this.form.valid && this.dialogRef.close(this.form.value.name);
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
