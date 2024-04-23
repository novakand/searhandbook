import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'h21-payment-failed-dialog',
  templateUrl: './payment-failed-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFailedDialogComponent {

  constructor(public dialogRef: MatDialogRef<PaymentFailedDialogComponent>) {}

  public cancel(): void {
    this.dialogRef.close(false);
  }

}
