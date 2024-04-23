import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

import { IH21DialogPanel } from 'h21-be-ui-kit';

@Component({
  selector: 'h21-payment-not-available-dialog',
  templateUrl: './payment-not-available-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentNotAvailableDialogComponent {

  public showImg = true;
  public data = this._panelData.data;

  constructor(
    public router: Router,
    @Inject(MAT_DIALOG_DATA) private _panelData: IH21DialogPanel,
    public dialogRef: MatDialogRef<PaymentNotAvailableDialogComponent>,
  ) { }

  public cancel(): void {
    const service = this.router.url.includes('hotel') ? 'hotel' : 'transfer';
    this.dialogRef.close(false);
    this.router.navigate([`/search/${service}/result`]);
  }

}
