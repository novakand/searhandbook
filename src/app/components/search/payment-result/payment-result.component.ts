import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// enums
import { PaymentResultState } from '@transfer/enums';

// services
import { PaymentService } from '@search/payment';
import { NotificationSignalRService } from '@core/services';
import { LoadProgressService } from 'h21-be-ui-kit';

@Component({
  selector: 'h21-payment-result',
  templateUrl: './payment-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PaymentService],
})
export class PaymentResultComponent implements OnInit, OnDestroy {

  public tripId: number;
  public result: any;
  public resultStateType = PaymentResultState;
  public resultState$ = this._service.resultState$;
  public showPreloader = true;
  public waitingMessage: string;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _service: PaymentService,
    private _notify: NotificationSignalRService,
    private _loadProgressService: LoadProgressService,
  ) {}

  public ngOnInit(): void {
    this._loadProgressService.show(1);
    this.waitingMessage = this._getWaitingMessage();
    this._service.onPaymentResult();
    this._onVoucherCreate();
    this._listenHidePreloader();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  private _onVoucherCreate(): void {
    this._notify.orderCreate$.pipe(takeUntil(this._destroy$))
      .subscribe((id) => {
        this.tripId = id;
        this._loadProgressService.hide(1);
        this.resultState$.next(PaymentResultState.Success);
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      });

    this._notify.orderCreateError$.pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._loadProgressService.hide(1);
        this.resultState$.next(PaymentResultState.Failed);
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      });
  }

  private _listenHidePreloader(): void {
    this._service.resultState$.pipe(takeUntil(this._destroy$))
      .subscribe(() => this.showPreloader = false);
  }

  private _getWaitingMessage(): string {
    return this._router.url.includes('transfer') ? 'We proceeding the payment' : 'We proceeding the reservation';
  }

}
