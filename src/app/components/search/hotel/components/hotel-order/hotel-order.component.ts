import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

// external libs
import { forkJoin, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as moment from 'moment';

// internal libs
import {
  H21DialogPanelService,
  IH21DialogPanel,
  LoadProgressService,
  Utils,
} from 'h21-be-ui-kit';

// components
import { SelectTravelerDialogComponent } from '@search/components/select-travelers-dialog';
import { SelectTripDialogComponent } from '@search/components/select-trip-dialog';

// interfaces
import { IHotelSearchResultItem, IRoomDescription } from '@hotel/interfaces';
import { IBookOrder, ITraveler } from '@components/search';

// models
import { HotelFilter } from '@hotel/models';

// enums
import { ReferenceType } from '@hotel/enums';

// services
import { CompanyReferenceService, NotificationSignalRService } from '@core/services';
import { PaymentService } from '@search/payment/payment.service';
import { HotelOrderService } from './hotel-order.service';
import { PaymentMethodService } from '@search/services';
import { BookService } from '@search/book.service';

// types
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'h21-hotel-order',
  templateUrl: './hotel-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ HotelOrderService, PaymentService, PaymentMethodService, BookService ],
})
export class HotelOrderComponent implements OnInit, OnDestroy {

  public hotel: IHotelSearchResultItem = {};
  public filter: HotelFilter;
  public travelers: ITraveler[];
  public form = this._orderService.buildForm(this._notify.context.connectionId);
  public userAgrees: boolean;
  public isPending: boolean;
  public formFieldAppearance: MatFormFieldAppearance = 'outline';
  public referenceTypes = ReferenceType;
  public hotelId = this._orderService.getHotelId();
  public connectionId = this._notify.context.connectionId;
  public originTripName: string;
  public isAllowed: boolean;
  public hotelInfo: IRoomDescription;
  public cancellationClass: string;
  public waitingMessage = 'Please wait. We are checking room availability';
  public routerLink = ['/search/hotel/result'];
  public btnTitle = 'Back to search';
  public tooLongRequest: boolean;
  public isAllowedControlRefs: boolean;
  public hasDefaultPrimaryTraveler = false;

  private _loadReferences$ = new Subject<number>();
  private _selectedTravelers: ITraveler[] = [];
  private _timeout: any;
  private _index = 0;
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _bookService: BookService,
    private _orderService: HotelOrderService,
    private _notify: NotificationSignalRService,
    private _references: CompanyReferenceService,
    private _loadProgressService: LoadProgressService,
    private _dialogPanelService: H21DialogPanelService,
    private _paymentMethodService: PaymentMethodService,
  ) {}

  public ngOnInit(): void {
    this._listenLoadReferences();
    this._loadProgressService.show(1);
    this._orderService.getHotelDescription(this.hotelId, this.connectionId);
    this.form.get('unitId').setValue(this.hotelId);

    this._initHotelInfoListener();
    this._requestTimeout();
  }

  public ngOnDestroy(): void {
    clearTimeout(this._timeout);
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public openSelectTripDialog(): void {
    const panelData: IH21DialogPanel = { data: {} };
    panelData.data.overlay = this._dialogPanelService.open(SelectTripDialogComponent, panelData);

    panelData.data.overlay.detachments().pipe(takeUntil(this._destroy$))
      .subscribe(() => this._orderService.fillTrip(panelData, this.form, this._cdr));
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
        tap((traveler: any) => this._orderService.addToSelectedTravelers(this.form, index, traveler, this._selectedTravelers)),
        takeUntil(this._destroy$),
      );

    detachments$.subscribe(() => !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges());
  }

  public clearTrip(): void {
    this.form.get('trip').reset();
    this.form.get('trip').get('name').setValue(this.originTripName);
  }

  public onPrimaryTravelerChange(index: number): void {
    if (index || index === 0) {
      (<FormArray>this.form.get('travelers')).controls.forEach((e: FormGroup) => {
        e.get('isPrimary').setValue(false);
        this._orderService.toggleFieldValidators((<FormControl>e.get('email')));
      });

      const primaryFormGroup = (<FormArray>this.form.get('travelers')).at(index);

      if (primaryFormGroup) {
        this._orderService.toggleFieldValidators((<FormControl>primaryFormGroup.get('email')), true, true);
        (<FormArray>this.form.get('travelers')).at(index).get('isPrimary').setValue(true);
      }
    }
  }

  public async onSubmit(): Promise<void> {
    this.form.get('travelers').updateValueAndValidity();
    this.form.get('references').updateValueAndValidity();

    this._addCountryCodeToTravelers();

    this._orderService.validateList(this.form, 'travelers');
    this._orderService.validateList(this.form, 'references');

    if (this.form.invalid) {
      this.form.get('references').invalid && this.scrollTo('references');
      this.form.get('travelers').invalid && !this.form.get('references').invalid && this.scrollTo('travelers');
      return;
    }

    await this._paymentMethodService.setPaymentMethod(this.form, this._selectedTravelers);

    this.cancellationClass === 'non-refundable' ? this._openNonRefundableDialog() : this.bookAction();
  }

  public bookAction(): void {
    const data = this._orderService.buildFormData(this.form);
    this._loadProgressService.show(1);
    this.waitingMessage = 'We proceeding the reservation';
    this.isPending = true;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    this._listenBookResult(data);
  }

  public removeReferenceFields(id: number): void { (<FormArray>this.form.controls.references).removeAt(id); }
  public scrollTo(id: string): void { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); }

  public clearTravelerFields(index: number): void {
    const control = (<FormArray>this.form.get('travelers')).controls[index];
    this._selectedTravelers.splice(this._selectedTravelers.indexOf(control.value), 1);
    const isPrimary = control.value.isPrimary;

    control.reset();
    control.patchValue({ isPrimary });
  }

  public trackByFn(index: number, item: ITraveler): number { return item.id; }
  public trackByFnArray(index: number, item): number { return item.id; }
  public addReferenceFields = (): void => this._orderService.addReferenceFields(this.form, this._index++);
  public trackByIndexFn(index: number, item: FormGroup): number { return item.value.id || item.value.index; }

  public selectType(type: ReferenceType, index: number): void {
    if (!this.isAllowedControlRefs) { return; }
    const typeValue = (<FormArray>this.form.get('references')).at(index).get(type).value;
    (<FormArray>this.form.get('references')).at(index).get(type).setValue(!typeValue);
  }

  private _initHotelInfoListener(): void {
    const cancellationPolicy$ = this._notify.cancellationPolicy$
      .pipe(
        switchMap(({ responseId }) => forkJoin(this._orderService.getHotelInfo(responseId), this._orderService.getCountries())),
        tap(([info]) => this._generateCancelClass(info)),
        takeUntil(this._destroy$),
      );

    cancellationPolicy$.subscribe(([info]) => {
      this.isAllowed = info.isAllowed;
      this._orderService.addTravelerFields(this.form, info.searchParam.adultsPerRoom * info.searchParam.amountOfRooms);
      this.hasDefaultPrimaryTraveler = !!info.searchParam.primaryTraveler;

      if (this.hasDefaultPrimaryTraveler) {
        this._orderService.addToSelectedTravelers(this.form, 0, info.searchParam.primaryTraveler, this._selectedTravelers);
        this._loadReferences$.next(info.searchParam.primaryTraveler.id);
      } else {
        this._loadReferences$.next(null);
      }

      this.originTripName = this._orderService.getOriginalTripName(info);
      this.form.get('trip').get('name').setValue(this.originTripName);
      this.hotelInfo = info;
      this._loadProgressService.hide(1);
      this._updateCancellationPolicy(info.room.id);
      this._cdr.markForCheck();
    });
  }

  private _updateCancellationPolicy(id: string): void {
    const updateCancellationPolicy$ = this._notify.updateCancellationPolicy$
      .pipe(
        filter((notify) => notify.roomId === id),
        takeUntil(this._destroy$),
      );

    updateCancellationPolicy$.subscribe(({ penaltyDate, isRefundable }) => {
      this.hotelInfo.room.penaltyDate = penaltyDate;
      this.hotelInfo.room.isRefundable = isRefundable;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _generateCancelClass(data: IRoomDescription): void {
    if (data.room.penaltyDate) {
      const isBefore = moment().utc().isSameOrBefore(data.room.penaltyDate);
      data.room.isRefundable && isBefore && (this.cancellationClass = 'is-refundable');
      !data.room.isRefundable || !isBefore && (this.cancellationClass = 'non-refundable');
    }
  }

  private _listenBookResult(data: IBookOrder): void {
    this._orderService.bookRoom(data).pipe(takeUntil(this._destroy$))
      .subscribe(() => this._bookService.book$.next(data));
  }

  private _requestTimeout(): void {
    this._timeout = setTimeout(() => {
      if (!this.hotelInfo) {
        this.tooLongRequest = true;
        this._loadProgressService.hide(1);
        this._cdr.markForCheck();
      }}, 120000);
  }

  private _openNonRefundableDialog(): void {
    this._orderService.listenNonRefundableDialogResult().pipe(takeUntil(this._destroy$))
      .subscribe(() => this.bookAction());
  }

  private _addCountryCodeToTravelers(): void {
    (<FormArray>this.form.get('travelers')).controls.forEach((traveler) => {
      const { country } = traveler.value;
      country && country.code && traveler.patchValue({ countryCode: country.code });
    });
    this.form.get('travelers').updateValueAndValidity();
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
        this._orderService.addReferenceFields(this.form, this._index);
      } else {
        references.forEach((item, i) => this._orderService.addReferenceFields(this.form, i, item));
      }
      this._cdr.markForCheck();
    });
  }

}
