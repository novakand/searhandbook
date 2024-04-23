import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

// rxjs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// external libs
import { IH21DialogPanel } from 'h21-be-ui-kit';

// interfaces
import { IOrderResult } from '@components/search/hotel/components/hotel-order/reference.interface';

// services
import { HotelGeneralInfoService } from '@components/search/hotel/services';

@Component({
  selector: 'h21-payment-price-change-dialog',
  templateUrl: './payment-price-change-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPriceChangeDialogComponent implements OnDestroy {

  public data: IOrderResult;

  public showImg = true;
  public pending: boolean;

  private _destroy$ = new Subject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private _panelData: IH21DialogPanel,
    private _router: Router,
    private _service: HotelGeneralInfoService,
    private _dialogRef: MatDialogRef<PaymentPriceChangeDialogComponent>,
  ) {
    this.data = _panelData.data;
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public pay(): void {
    this.pending = true;
    this._service.getBookResult(this.data).pipe(takeUntil(this._destroy$))
      .subscribe(
        () => this._dialogRef.close(true),
        () => this._dialogRef.close(false),
      );
  }

  public cancel(): void {
    const service = this._router.url.includes('hotel') ? 'hotel' : 'transfer';
    this._dialogRef.close(false);
    this._router.navigate([`/search/${service}/result`]);
  }

}
