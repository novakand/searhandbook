import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'h21-payment-time-over-dialog',
  templateUrl: './payment-time-over-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentTimeOverDialogComponent {

  constructor(public dialogRef: MatDialogRef<PaymentTimeOverDialogComponent>) {}

  public cancel(): void {
    this.dialogRef.close(false);
  }

}
