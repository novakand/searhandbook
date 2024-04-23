import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

// material
import { MatFormFieldAppearance } from '@angular/material/form-field';

// rxjs
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

// services
import { PaymentService } from './payment.service';
import { BookService } from '@search/book.service';

// models
import { PaymentBody } from '@search/models/payment-body.model';

// enums
import { PaymentType, SearchMode } from '@search/enums';
import { PaymentMethod, PaymentSystem } from './payment.enum';

// interfaces
import { IPaymentInfo, IPaymentItem, IPaymentList } from './interfaces';

@Component({
  selector: 'h21-payment',
  templateUrl: './payment.component.html',
  styleUrls: [ './payment.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PaymentService, BookService],
})
export class PaymentComponent implements OnInit, OnDestroy {

  public formFieldAppearance: MatFormFieldAppearance = 'outline';
  public tabColor = 'rgba(var(--primary-rgb), 0.11)';
  public timeLeft: number;
  public pendingAir: boolean;
  public pendingBta: boolean;

  public bookingTypes = SearchMode;
  public paymentTypes = PaymentType;
  public paymentType: PaymentType;
  public paymentData: IPaymentInfo;

  public airPlusForm: FormGroup = this._service.getReferenceForm();
  public btaForm: FormGroup = this._service.getReferenceForm();

  public cards$ = new BehaviorSubject<IPaymentList[]>([]);

  private _queryParams: Params = this._active.snapshot.queryParams;
  private _timeLeftInterval: any;

  private _payVision$ = new Subject<IPaymentItem>();
  private _airPlus$ = new Subject<IPaymentItem>();
  private _bta$ = new Subject<IPaymentItem>();

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _active: ActivatedRoute,
    private _service: PaymentService,
    private _bookService: BookService,
  ) {}

  public ngOnInit(): void {
    this._listenPayVision();
    this._listenAirPlus();
    this._listenBTA();

    this._getPaymentInfo();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();

    clearInterval(this._timeLeftInterval);
  }

  public trackByFn = (i, v): string => v.id;
  public trackByFnArray = (_: number, item: FormGroup): number => item.value.id;

  public onCancel = (): void => this._service.cancel(this._queryParams.unitId, this._queryParams.connectionId, this.paymentData.type);

  public onSubmit = (form: FormGroup, field: string): void => form.invalid ? this._markFields(form) : this._sendEmailToSupport(form, field);

  public onCardChange(id: number, form: FormGroup): void {
    const item = this.cards$.getValue().find((v) => v.id === id);

    if (item) {
      this._service.removeAllReferenceFields(form);
      this._service.addReferenceFields(form, item.referencesActual.length);
      form.patchValue(item);
      this._updateControlSettings(item.referencesActual, form);
    }
  }

  public setPaymentType(type: PaymentType): void {
    const { paymentInit } = this.paymentData;
    this.paymentType = type;

    switch (type) {
      case this.paymentTypes.card:
        this._payVision$.next(paymentInit.payVision);
        break;
      case this.paymentTypes.airPlus:
        this._service.removeAllReferenceFields(this.airPlusForm);
        this._airPlus$.next(paymentInit.airPlus);
        break;
      case this.paymentTypes.bta:
        this._service.removeAllReferenceFields(this.btaForm);
        this._bta$.next(paymentInit.bta);
        break;
    }
  }

  private _sendEmailToSupport(form: FormGroup, field: string): void {
    this[field] = true;
    const refs = (<FormArray>form.get('referencesActual')).controls.map((group: FormGroup) => group.getRawValue());
    const body = new PaymentBody(this._queryParams.unitId, this._queryParams.connectionId, form.get('id').value, refs);
    const bookData = {
      paymentMethod: PaymentMethod.PayNow,
      connectionId: this._queryParams.connectionId,
      unitId: this._queryParams.unitId,
    };
    this._bookService.showProgress(this._cdr);

    this._service.sendEmailToSupport(body).pipe(takeUntil(this._destroy$))
      .subscribe(() => this._bookService.book$.next(bookData));
  }

  private _markFields(form: FormGroup): void {
    (<FormArray>form.get('referencesActual')).controls.forEach((group: FormGroup) =>
      group.get('value').markAsTouched(),
    );
  }

  private _startCountdown(): void {
    this._timeLeftInterval = setInterval(() => {
      this.timeLeft -= 1000;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();

      if (!this.timeLeft) {
        clearInterval(this._timeLeftInterval);
        this._service.navigateTo(this.paymentData.type);
      }
    }, 1000);
  }

  private _getPaymentInfo(): void {
    this._service
      .getPaymentInfo(this._queryParams.unitId, this._queryParams.connectionId)
      .pipe(
        tap((info: IPaymentInfo) => this.paymentData = info),
        tap(() => this.timeLeft = (this.paymentData.timeout * 60 * 1000)),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {

        this._startCountdown();
        this._checkDefaultPaymentSystem();

        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _listenPayVision(): void {
    this._payVision$.pipe(takeUntil(this._destroy$)).subscribe(({ id }) => this._service.loadWidget(id));
  }

  private _setFormData(list, form: FormGroup): void {
    const isDefault = list.find((v) => v.isDefault);

    if (isDefault) {
      this._service.addReferenceFields(form, isDefault.referencesActual.length);
      form.patchValue(isDefault,  { emitEvent: false });
      this._updateControlSettings(isDefault.referencesActual, form);
    }
    this._cdr.detectChanges();
  }

  private _updateControlSettings(list, form: FormGroup): void {
    list.forEach((v, i) => {
      v.isDisabled && (<FormArray>form.get('referencesActual')).controls[i].get('value').disable();
      v.isRequired && (<FormArray>form.get('referencesActual')).controls[i].get('value').setValidators([Validators.required]);
    });
  }

  private _listenAirPlus(): void {
    this._airPlus$
      .pipe(
        filter(Boolean),
        switchMap((airPlus) => this._service.getCompanyAirPlusPaymentMethods(airPlus.id)),
        tap((list) => this._setFormData(list, this.airPlusForm)),
        takeUntil(this._destroy$),
      ).subscribe((airPlus) => this.cards$.next(airPlus));
  }

  private _listenBTA(): void {
    this._bta$
      .pipe(
        filter(Boolean),
        switchMap((bta) => this._service.getCompanyBTAPaymentMethods(bta.id)),
        tap((list) => this._setFormData(list, this.btaForm)),
        takeUntil(this._destroy$),
      ).subscribe((bta) => this.cards$.next(bta));
  }

  private _checkDefaultPaymentSystem(): void {
    const { paymentAccess: { paymentSystem }, paymentInit } = this.paymentData;

    switch (paymentSystem) {
      case PaymentSystem.CreditCard:
      case PaymentSystem.BankTransfer:
        this._payVision$.next(paymentInit.payVision);
        this.paymentType = this.paymentTypes.card;
        break;
      case PaymentSystem.AirPlus:
        this._airPlus$.next(paymentInit.airPlus);
        this.paymentType = this.paymentTypes.airPlus;
        break;
      case PaymentSystem.BTA:
        this._bta$.next(paymentInit.bta);
        this.paymentType = this.paymentTypes.bta;
        break;
    }
  }

}
