import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

// external libs
import { Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

// inner libs
import {
  H21DialogPanelService,
  IH21DialogPanel,
  LoadProgressService,
  Utils,
} from 'h21-be-ui-kit';

// models
import { Transfer, TransferFilter, Vehicle } from '../../models';

// enums
import { ReferenceType } from '../../../hotel/enums';

// interfaces
import { ITraveler } from '../../../interfaces';

// services
import { TransferOrderService } from '@transfer/components/transfer-order/transfer-order.service';
import { NotificationSignalRService } from '@core/services/notification-signalr.service';
import { CompanyReferenceService } from '@core/services';
import { PaymentMethodService } from '@search/services';
import { PaymentService } from '@search/payment';
import { BookService } from '@search/book.service';

// components
import { SelectTravelerDialogComponent } from '../../../components/select-travelers-dialog';
import { SelectTripDialogComponent } from '../../../components/select-trip-dialog';

// types
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'h21-transfer-order',
  templateUrl: './transfer-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PaymentService, PaymentMethodService, TransferOrderService, BookService],
})
export class TransferOrderComponent implements OnInit, OnDestroy {

  public car: Vehicle;
  public filter: TransferFilter;
  public travelers: ITraveler[];
  public form = this._transferOrderService.buildForm(this._notify.context.connectionId);
  public userAgrees: boolean;
  public isPending: boolean;
  public referenceTypes = ReferenceType;
  public formFieldAppearance: MatFormFieldAppearance = 'outline';

  public originTripName: string;
  public btnTitle = 'Back to search';
  public tooLongRequest: boolean;
  public isAllowedControlRefs: boolean;
  public routerLink = ['/search/transfer/result'];
  public hasDefaultPrimaryTraveler = false;

  private _loadReferences$ = new Subject<number>();
  private _selectedTravelers: ITraveler[] = [];
  private _toggledControls = ['email', 'mobilePhone'];
  private _index = 0;
  private _transfer: Transfer;
  private _bookSuccess: boolean;
  private _timeout: any;
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _bookService: BookService,
    private _paymentService: PaymentService,
    private _notify: NotificationSignalRService,
    private _references: CompanyReferenceService,
    private _loadProgressService: LoadProgressService,
    private _dialogPanelService: H21DialogPanelService,
    private _transferOrderService: TransferOrderService,
    private _paymentMethodService: PaymentMethodService,
  ) {}

  public ngOnInit(): void {
    this._listenLoadReferences();
    this._loadProgressService.show(1);
    this._getOrderData();
  }

  public ngOnDestroy(): void {
    clearTimeout(this._timeout);
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number, item: ITraveler): number { return item.id; }
  public trackByFnArray(index: number, item: FormGroup): number { return item.value.index || item.value.id; }

  public openSelectTripDialog(): void {
    const panelData: IH21DialogPanel = { data: {  } };

    panelData.data.overlay = this._dialogPanelService.open(SelectTripDialogComponent, panelData);
    panelData.data.overlay.detachments().pipe(takeUntil(this._destroy$))
      .subscribe(() => this._transferOrderService.fillTrip(panelData, this.form, this._cdr));
  }

  public openSelectTravelersDialog(index: number): void {
    const companyProfileIds = this._selectedTravelers.length ? this._selectedTravelers[0].companyProfileIds : null;

    const panelData: IH21DialogPanel = {
      data: {
        selectedTravelers: Utils.deepCopy(this._selectedTravelers),
        profileId: null,
        companyProfileIds,
        singleSelectMode: true,
        disableRemove: true,
      },
    };
    panelData.data.overlay = this._dialogPanelService.open(SelectTravelerDialogComponent, panelData);

    const detachments$ = panelData.data.overlay.detachments()
      .pipe(
        filter(() => !!panelData.data.selectedTraveler),
        map(() => Utils.deepCopy(panelData.data.selectedTraveler)),
        tap((traveler: any) => this._transferOrderService.addToSelectedTravelers(this.form, index, traveler, this._selectedTravelers)),
        takeUntil(this._destroy$),
      );

    detachments$.subscribe();
  }

  // todo: Нужно удалить метод, и переделать функционал по примеру того, как это сделано в заказах отелей
  public back(): void {
    this._transferOrderService.goToPreviousPage(this.filter);
  }

  public clearTrip(): void {
    this.form.get('trip').reset();
    this.form.get('trip').get('name').setValue(this.originTripName);
  }

  public addReferenceFields(): void {
    this._transferOrderService.addReferenceFields(this.form, this._index++);
  }

  public removeReferenceFields(id: number): void { (<FormArray>this.form.controls.references).removeAt(id); }

  public clearTravelerFields(index: number): void {
    const control = (<FormArray>this.form.get('travelers')).controls[index];
    this._selectedTravelers.splice(this._selectedTravelers.indexOf(control.value), 1);
    const { value: { isPrimary } } = control;
    control.reset();
    control.patchValue({ isPrimary });
  }

  public onPrimaryTravelerChange(index: number): void {
    if (index || index === 0) {
      (<FormArray>this.form.get('travelers')).controls.forEach((e: FormGroup) => {
        e.get('isPrimary').setValue(false);
        this._toggledControls.forEach((v) => this._transferOrderService.toggleFieldValidators((<FormControl>e.get(v))));
      });

      const primaryFormGroup = (<FormArray>this.form.get('travelers')).at(index);
      if (primaryFormGroup) {
        this._transferOrderService.toggleFieldValidators((<FormControl>primaryFormGroup.get('email')), true, true);
        this._transferOrderService.toggleFieldValidators((<FormControl>primaryFormGroup.get('mobilePhone')), true);
        (<FormArray>this.form.get('travelers')).at(index).get('isPrimary').setValue(true);
      }
    }
  }

  public onSubmit(): void {
    this.form.get('travelers').updateValueAndValidity();
    this.form.get('references').updateValueAndValidity();
    this._transferOrderService.validateList(this.form, 'travelers');
    this._transferOrderService.validateList(this.form, 'references');

    this.form.valid ? this._bookTransfer() : this._transferOrderService.scrollToInvalidFields(this.form);
  }

  public selectType(type: ReferenceType, index: number): void {
    if (!this.isAllowedControlRefs) { return; }
    this._transferOrderService.selectReferenceType(this.form, type, index);
  }

  private _getOrderData(): void {
    this._transferOrderService.getOrderData().pipe(takeUntil(this._destroy$))
      .subscribe(([history, transfer]) => {
        this._transfer = transfer;
        this._transferOrderService.addTravelerFields(history.travelersQuantity, this.form);
        this._fillAndInit(history);
        this._loadProgressService.hide(1);
        this._cdr.markForCheck();
      });
  }

  private _fillAndInit(history: TransferFilter): void {
    this.filter = history;
    this.hasDefaultPrimaryTraveler = !!history.primaryTraveler;

    if (this.hasDefaultPrimaryTraveler) {
      this._transferOrderService.addToSelectedTravelers(this.form, 0, history.primaryTraveler, this._selectedTravelers);
      this._loadReferences$.next(history.primaryTraveler.id);
    } else {
      this._loadReferences$.next(null);
    }

    this._setDefaultTripName();
    this.car = this._transfer.vehicles[0];
  }

  private _setDefaultTripName(): void {
    this.originTripName = this._transferOrderService.getOriginalTripName(this.filter.routes[0]);
    this.form.get('trip').get('name').setValue(this.originTripName);
  }

  private async _bookTransfer(): Promise<void> {
    this._loadProgressService.show(1);
    this.isPending = true;
    this._cdr.markForCheck();
    this._requestTimeout();

    await this._paymentMethodService.setPaymentMethod(this.form, this._selectedTravelers);

    const { primaryTravelerIndex, ...body } = this.form.getRawValue();

    const data = this._transferOrderService.getBookTransferData(body);

    this._transferOrderService.bookTransfer(data).pipe(takeUntil(this._destroy$))
      .subscribe(() => this._bookService.book$.next(data));
  }

  private _requestTimeout(): void {
    this._timeout = setTimeout(() => {
      if (!this._bookSuccess) {
        this.tooLongRequest = true;
        this.isPending = false;
        this._loadProgressService.hide(1);
        this._cdr.markForCheck();
      }}, 120000);
  }

  private _listenLoadReferences(): void {
    const references$ = this._loadReferences$
      .pipe(
        switchMap((travelerId) => this._references.getByTravelerId(travelerId)),
        tap((refs) => this.isAllowedControlRefs = !refs || !refs.length),
        filter(Boolean),
        takeUntil(this._destroy$),
      );

    references$.subscribe((references) => {
      if (this.isAllowedControlRefs) {
        this._transferOrderService.addReferenceFields(this.form, this._index);
      } else {
        references.forEach((item, i) => this._transferOrderService.addReferenceFields(this.form, i, item));
      }
      this._cdr.markForCheck();
    });
  }

}
