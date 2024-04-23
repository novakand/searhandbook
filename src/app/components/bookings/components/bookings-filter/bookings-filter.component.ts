import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
// external libs
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
// internal libs
import { DIALOG_PANEL_DATA, HttpClientService, IH21DialogPanel, PanelAction, Utils } from 'h21-be-ui-kit';
// enums
import { AnimationState } from '@app/enums/animation-state';
// models
import { BookingsFilterModel } from '../../models';
// animation
import { ToggleSlideAnimation } from '@app/animations';
import { BookingsService } from '../../services/bookings.service';
// interfaces
import { IBookingFilterPanelData, IDictionaryItem } from '../../interfaces';
// date format
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SB_DATE_FORMATS } from '@components/search/transfer';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { environment } from '@environments/environment';
import { SearchMode } from '@search/enums';

@Component({
  selector: 'h21-bookings-filter',
  templateUrl: './bookings-filter.component.html',
  animations: [
    ToggleSlideAnimation,
  ],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: SB_DATE_FORMATS,
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsFilterComponent implements AfterViewInit, OnDestroy, OnInit {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();
  public formFieldAppearance: MatFormFieldAppearance = 'outline';
  public form: FormGroup;
  public filter: BookingsFilterModel;
  public displayColumns = this._dialogPanel.data.displayColumns;

  public orderItemTypes$: Observable<IDictionaryItem[]> = this._bookingService.getOrderTypes();
  public orderStates$: Observable<IDictionaryItem[]> = this._bookingService.getOrderStates();
  public paymentStates$: Observable<IDictionaryItem[]> = this._bookingService.getPaymentStates();
  public payTypes$ = this._bookingService.getPaymentMethodList();
  public suppliers$ = this._bookingService.getProviderList();
  public bookerList$: Observable<IDictionaryItem[]>;
  public showEnterHint = false;

  private _prevShowEnterHintState = false;

  @ViewChild('container') private _container: ElementRef;
  @ViewChild('bookerData') private _bookerData: ElementRef;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _http: HttpClientService,
    private _bookingService: BookingsService,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel<IBookingFilterPanelData>,
  ) { }

  public ngOnInit(): void {
    this._buildForm();
    this.filter = { ...this._dialogPanel.data.filter };
    this.form.patchValue(this.filter);
  }

  public ngAfterViewInit() {
    this._container.nativeElement.focus();
    this._listenBooker();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index) {
    return index;
  }

  public displayFn(item: IDictionaryItem): string {
    return item && item.name;
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  public clear(): void {
    this.form.reset();
  }

  public submit(): void {
    this._dialogPanel.data.filter = new BookingsFilterModel(this.form.value);
    this._dialogPanel.data.action = PanelAction.SAVE;
    this._dialogPanel.data.overlay.detach();
  }

  public close(action: PanelAction = PanelAction.CLOSE): void {
    this._dialogPanel.data.action = action;
    this._dialogPanel.data.overlay.detach();
  }

  public setCorrectDate(dateName: string, date): void {
    this.filter[dateName] = date ? Utils.getDateWithOffset(new Date(Date.parse(date))) : null;
    this.form.patchValue(this.filter);
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      typeIdIn: new FormControl(),
      providerTypeCodeIn: new FormControl(),
      paymentFormIdIn: new FormControl(),
      viewOrderNumberContains: new FormControl(),
      tripNameContains: new FormControl(),
      bookingCode: new FormControl(),
      createUserName: new FormControl(),
      customerNameStart: new FormControl(),
      createDateGreaterEqual: new FormControl(),
      createDateLessEqual: new FormControl(),
      arrivalDateGreaterEqual: new FormControl(),
      arrivalDateLessEqual: new FormControl(),
      departureDateGreaterEqual: new FormControl(),
      departureDateLessEqual: new FormControl(),
      tourOperatorCode: new FormControl(),
      tourOperatorNameStart: new FormControl(),
      payAccountNumber: new FormControl(),
      h21ProLogin: new FormControl(),
      customerCompanyNameContains: new FormControl(),
      companyNameContains: new FormControl(),
      invoiceNumberContains: new FormControl(),
      bookerId: new FormControl(),
      finalCostGreaterEqual: new FormControl(),
      finalCostLessEqual: new FormControl(),
      orderStateCodeIn: new FormControl(),
      paymentStateCodeIn: new FormControl(),
      paymentStateIdIn: new FormControl(),
      providerConfirmation: new FormControl(),
    });
  }

  private _listenBooker(): void {
    const isAutocompleteBooker = (booker) => booker && typeof booker !== 'string';

    const keyup$ = fromEvent(this._bookerData.nativeElement, 'keyup')
      .pipe(
        debounceTime(environment.debounceTime),
        filter((event: KeyboardEvent) => {
          const text = (<HTMLInputElement>event.target).value;
          this._showEnterHintHandler(text);
          return event.key === 'Enter' || text.length > 2;
        }),
        map((event: KeyboardEvent) => (<HTMLInputElement>event.target).value),
        distinctUntilChanged(),
      );

    this.bookerList$ = keyup$
      .pipe(
        map((booker) => isAutocompleteBooker(booker) ? booker[name] : booker),
        switchMap((booker: string) => this._bookingService.getBookerList(booker)),
      );
  }

  private _showEnterHintHandler(text: string): void {
    this.showEnterHint = text.length && text.length < 3;
    this._prevShowEnterHintState !== this.showEnterHint && this._cdr.detectChanges();
  }

}
