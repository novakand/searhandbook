import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { iif, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

// interfaces
import { IOrderResult } from '@hotel/components/hotel-order/reference.interface';

// services
import { NotificationSignalRService } from '@core/services';
import { PaymentService } from '@search/payment/payment.service';
import { LoadProgressService } from 'h21-be-ui-kit';

// enums
import { PaymentMethod } from '@search/payment/payment.enum';

interface IBook {
  connectionId: string;
  paymentMethod: PaymentMethod;
  unitId: string;
}

@Injectable()
export class BookService implements OnDestroy {

  public book$ = new Subject<IBook>();

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _loadProgressService: LoadProgressService,
    private _notify: NotificationSignalRService,
    private _paymentService: PaymentService,
    private _router: Router,
  ) {
    this._listenNotify();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public showProgress(cd: ChangeDetectorRef): void {
    this._loadProgressService.show(1);
    cd.detectChanges();
  }

  private _listenNotify(): void {
    let bookInfo: IBook;
    let _verify;

    const notify$ = this.book$
      .pipe(
        tap((data) => bookInfo = data),
        switchMap(() => this._notify.verificationService$),
        tap(({ isSuccess }) => isSuccess && this._checkNavigationToPayment(bookInfo)),
        tap((verify) => _verify = verify),
        tap((verify) => !verify.isSuccess && this._openPriceChangeDialog(verify, bookInfo)),
        switchMap((verify) => iif(() => verify.isSuccess, this._notify.bookResult$)),
        takeUntil(this._destroy$),
      );

    notify$.subscribe((book: IOrderResult) => {
      book.isSuccess ? this._navigateToPaymentResult() : this._paymentService.openNotAvailableDialog(_verify);
    });
  }

  private _navigateToPayment(connectionId: string, unitId: string): void {
    const service = this._router.url.includes('hotel') ? 'hotel' : 'transfer';
    this._router.navigate([`/search/${service}/payment`], { queryParams: { connectionId, unitId } });
  }

  private _navigateToPaymentResult(): void {
    const service = this._router.url.includes('hotel') ? 'hotel' : 'transfer';
    this._router.navigate([`/search/${service}/payment-result`]);
  }

  private _checkNavigationToPayment(book: IBook): void {
    const { paymentMethod, unitId, connectionId } = book;
    const isPayNow = paymentMethod === PaymentMethod.PayNow;
    isPayNow && this._navigateToPayment(connectionId, unitId);
  }

  private _openPriceChangeDialog(verify: IOrderResult, book: IBook): void {
    this._loadProgressService.hide(1);
    verify.id = book.unitId;
    verify.connectionId = book.connectionId;
    this._paymentService.openPriceChangeDialog(verify).pipe(takeUntil(this._destroy$))
      .subscribe((result) => result && this._loadProgressService.show(1));
  }

}
