import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

// external libs
import { Observable, Subject } from 'rxjs';
import { first, switchMap, takeUntil } from 'rxjs/operators';

// inner libs
import { LoaderService, LoadProgressService } from 'h21-be-ui-kit';

// components
import { PaymentPriceChangeDialogComponent } from './payment-price-change-dialog';
import { PaymentFailedDialogComponent } from './payment-failed-dialog';
import { PaymentTimeOverDialogComponent } from './payment-time-over-dialog';
import { PaymentNotAvailableDialogComponent } from './payment-not-available-dialog';

// interfaces
import { IOrderResult } from '@components/search/hotel/components/hotel-order/reference.interface';
import { IPaymentInfo, IPaymentList } from '@search/payment/interfaces/payment-info.interface';

// enums
import { PaymentResultState } from '../transfer/enums/index';
import { SearchMode } from '@search/enums';

// services
import { SearchPaymentService } from '@components/search/services';
import { NotificationSignalRService } from '@core/services';
import { TransferService } from '@transfer/services';

// environment
import { environment } from '@environments/environment';

// models
import { PayCancel } from '@search/transfer';
import { PaymentBody } from '@search/models/payment-body.model';

@Injectable()
export class PaymentService implements OnDestroy {

  public resultState$ = new Subject<PaymentResultState>();

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _dialog: MatDialog,
    private _loader: LoaderService,
    private _paymentService: SearchPaymentService,
    private _notification: NotificationSignalRService,
    private _loadProgressService: LoadProgressService,
    private _fb: FormBuilder,
    private _transferService: TransferService,
  ) {}

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public sendEmailToSupport(body: PaymentBody): Observable<void> {
    return this._http.post<void>(`${environment.apiGatewayUri}Payment/SendEmailToSupport`, body);
  }

  public getCompanyBTAPaymentMethods(id: string): Observable<IPaymentList[]> {
    const params = new HttpParams().set('id', id);
    return this._http.get<IPaymentList[]>(`${environment.apiGatewayUri}Payment/GetCompanyBTAPaymentMethods`, { params });
  }

  public getCompanyAirPlusPaymentMethods(id: string): Observable<IPaymentList[]> {
    const params = new HttpParams().set('id', id);
    return this._http.get<IPaymentList[]>(`${environment.apiGatewayUri}Payment/GetCompanyAirPlusPaymentMethods`, { params });
  }

  public loadWidget(checkOutId): void {
    const url = `${environment.paymentWidgetUri}/v1/paymentWidgets.js?checkoutId=${checkOutId}`;

    this._loader.loadScript(url).pipe(first()).subscribe(() => this._loadProgressService.hide(1));
  }

  public onPaymentResult(): void {
    const paymentResult$ = this._notification.paymentResult$
      .pipe(
        switchMap(({ responseId }) => this._paymentService.paymentResult(responseId)),
        takeUntil(this._destroy$),
      );

    paymentResult$.subscribe(({ isSuccess }) => {
      const state = isSuccess ? PaymentResultState.Success : PaymentResultState.Failed;
      state === PaymentResultState.Failed && this._loadProgressService.hide(1);
      this.resultState$.next(state);
    });
  }

  public openPriceChangeDialog(data: IOrderResult): Observable<any> {
    const dialogRef = this._dialog.open(PaymentPriceChangeDialogComponent, {
      data: { data },
      disableClose: true,
      autoFocus: false,
      minWidth: '480px',
      maxWidth: '600px',
      backdropClass: 'h21-dialog_dark-backdrop',
      panelClass: 'sb-payment-dialog_panel',
    });

    return dialogRef.afterClosed();
  }

  public openFailedDialog(): void {
    const dialogRef = this._dialog.open(PaymentFailedDialogComponent, {
      data: {},
      disableClose: true,
      autoFocus: false,
      minWidth: '480px',
      maxWidth: '600px',
      backdropClass: 'h21-dialog_dark-backdrop',
      panelClass: 'sb-payment-dialog_panel',
    });

    dialogRef.afterClosed();
  }

  public openTimeOverDialog(): void {
    const dialogRef = this._dialog.open(PaymentTimeOverDialogComponent, {
      data: {},
      disableClose: true,
      autoFocus: false,
      minWidth: '480px',
      maxWidth: '600px',
      backdropClass: 'h21-dialog_dark-backdrop',
      panelClass: 'sb-payment-dialog_panel',
    });

    dialogRef.afterClosed();
  }

  public openNotAvailableDialog(data: IOrderResult): void {
    this._loadProgressService.hide(1);
    const dialogRef = this._dialog.open(PaymentNotAvailableDialogComponent, {
      data: { data },
      disableClose: true,
      autoFocus: false,
      minWidth: '480px',
      maxWidth: '600px',
      backdropClass: 'h21-dialog_dark-backdrop',
      panelClass: 'sb-payment-dialog_panel',
    });

    dialogRef.afterClosed();
  }

  public getPaymentInfo(unitId: string, connectionId: string): Observable<IPaymentInfo> {
    const params = new HttpParams().set('connectionId', connectionId);

    return this._http.get<IPaymentInfo>(`${environment.apiOrderUri}Payment/InitializeByUnitId/${unitId}`, { params });
  }

  public getReferenceForm(): FormGroup {
    return this._fb.group({
      id: new FormControl(),
      referencesActual: this._fb.array([]),
    });
  }

  public removeAllReferenceFields(fg: FormGroup): void {
    const refs = <FormArray>fg.controls.referencesActual;
    while (refs.length) { refs.removeAt(0); }
  }

  public addReferenceFields(fg: FormGroup, count: number): void {
    Array.from({ length: count }, (v, i) => i).forEach(() =>
      (<FormArray>fg.get('referencesActual')).push(this._buildRef()),
    );
  }

  public cancel(unitId: string, connectionId: string, serviceType: SearchMode): void {
    this._cancel(unitId, connectionId).pipe(takeUntil(this._destroy$)).subscribe(() => this.navigateTo(serviceType));
  }

  public navigateTo(serviceType: SearchMode): void {
    this._router.navigateByUrl(`search/${serviceType}`);
  }

  private _buildRef(): FormGroup {
    return this._fb.group({
      name: new FormControl(),
      value: new FormControl(),
      id: new FormControl(),
      code: new FormControl(),
      referenceName: new FormControl(),
      isDisabled: new FormControl(),
      isRequired: new FormControl(),
    });
  }

  private _cancel(unitId: string, connectionId: string): Observable<void> {
    const params = new HttpParams().set('connectionId', connectionId);

    return this._http.get<void>(`${environment.apiOrderUri}Payment/CancelBooking/${unitId}`, { params });
  }

}
