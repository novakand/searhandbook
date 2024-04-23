import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// ui-kit
import { IH21DialogPanel, Utils } from 'h21-be-ui-kit';

// enums
import { ReferenceType } from '@hotel/enums';

// models
import { TransferFilter } from '@search/transfer';

// services
import { HistorySearchService } from '@core/services';
import { TransferService } from '@transfer/services';

// interfaces
import { IBookOrder, ITraveler } from '@components/search';
import { ICompanyReference } from '@core/interfaces';

// pipes
import { H21DatePipe, H21TimePipe } from '@shared/pipes';

// env
import { environment } from '@environments/environment';

@Injectable()
export class TransferOrderService implements OnDestroy {

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _history: HistorySearchService,
    private _datePipe: H21DatePipe,
    private _timePipe: H21TimePipe,
    private _transferService: TransferService,
    private _http: HttpClient,
  ) {}

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public getBookTransferData(form): IBookOrder {
    const data = Utils.deepCopy(form);
    data.references = data.references.map((reference) => {
      reference.id = null;
      return reference;
    });
    data.travelers = data.travelers.map((traveler) => {
      traveler.travelerId = traveler.id;
      traveler.id = null;
      return traveler;
    });
    return data;
  }

  public getOrderData(): Observable<any | TransferFilter[]> {
    const history$ = this._history.getByRequestId<TransferFilter>('transfer');
    const transfer$ = this._getTransfer();

    return forkJoin(history$, transfer$);
  }

  public navigateToTransferSearchResult(): void {
    this._router.navigateByUrl('/search/transfer/result');
  }

  public buildForm(connectionId: string): FormGroup {
    return this._fb.group({
      unitId: new FormControl(this._route.snapshot.queryParams.transferId),
      connectionId: new FormControl(connectionId),
      trip: this._fb.group({
        id: new FormControl(),
        description: new FormControl(),
        name: new FormControl(),
      }),
      comment: new FormControl(),
      primaryTravelerIndex: new FormControl(0),
      travelers: this._fb.array([]),
      references: this._fb.array([]),
      paymentMethod: new FormControl(),
    });
  }

  public addTravelerFields(count: number, form: FormGroup): void {
    const arr = <FormArray>form.controls.travelers;
    for (let i = 0; i < count; i++) {
      arr.push(this._fb.group({
        id: new FormControl(),
        lastName: new FormControl(null, Validators.required),
        firstName: new FormControl(null, Validators.required),
        email: new FormControl(null, this._getEmailValidators(i)),
        isPrimary: new FormControl(i === 0),
        mobilePhone: new FormControl(null, this._getMobilePhoneValidators(i)),
        orderItemId: new FormControl(),
        travelerId: new FormControl(),
        customerCompanyProfileId: new FormControl(),
        customerCompanyName: new FormControl(),
      }));
    }
  }

  public toggleFieldValidators(field: FormControl, required = false, email = false): void {
    if (required && email) {
      field.setValidators([ Validators.required, Validators.email ]);
    } else if (required) {
      field.setValidators(Validators.required);
    } else if (email) {
      field.setValidators(Validators.email);
    } else {
      field.clearValidators();
    }
    field.updateValueAndValidity();
    field.markAsUntouched();
  }

  public bookTransfer(body: IBookOrder): Observable<any> {
    return this._http.post<void>(`${environment.apiOrderUri}transfer/Booking/Book`, body);
  }

  public addReferenceFields(form: FormGroup, index: number, item: ICompanyReference = { mandatory: true }): void {
    const arr = <FormArray>form.controls.references;
    const value = (item.valuesActual && item.valuesActual.length === 1 && item.valuesActual[0].value) || null;

    const group = new FormGroup({
      name: new FormControl({ value: item.name, disabled: !!item.name }, [Validators.required, Validators.maxLength(20)]),
      value: new FormControl({ value: value, disabled: !!value }),
      valuesActual: new FormControl(item.valuesActual),
      [ReferenceType.isInvoice]: new FormControl(item[ReferenceType.isInvoice]),
      [ReferenceType.myBookings]: new FormControl(item[ReferenceType.myBookings]),
      orderItemId: new FormControl(),
      index: new FormControl(index),
      id: new FormControl(item.id),
    });
    item.mandatory && group.get('value').setValidators([Validators.required, Validators.maxLength(200)]);
    arr.push(group);
  }

  public addToSelectedTravelers(form: FormGroup, index: number, traveler: ITraveler, selectedTravelers: ITraveler[]): void {
    (<FormArray>form.get('travelers')).controls[index].patchValue(traveler);
    selectedTravelers.push(traveler);
  }

  public fillTrip(panelData: IH21DialogPanel, form: FormGroup, cd: ChangeDetectorRef): void {
    const selectedTrip = panelData.data.selectedTrip;
    selectedTrip && form.get('trip').patchValue(selectedTrip);
    cd.markForCheck();
  }

  public getOriginalTripName({ fromDate, toLocation: { address } }): string {
    const time = `${this._datePipe.transform(fromDate)} ${this._timePipe.transform(fromDate)}`;
    return `${address} ${time}`;
  }

  public selectReferenceType(form: FormGroup, type: ReferenceType, index: number): void {
    const typeValue = (<FormArray>form.get('references')).at(index).get(type).value;
    (<FormArray>form.get('references')).at(index).get(type).setValue(!typeValue);
  }

  public validateList(form: FormGroup, name: string): void {
    (<FormArray>form.get(name)).controls.forEach((v, i) => {
      Object.keys((<FormGroup>(<FormArray>form.get(name)).at(i)).controls).forEach((z) => {
        (<FormArray>form.get(name)).at(i).get(z).updateValueAndValidity();
        (<FormArray>form.get(name)).at(i).get(z).markAsTouched();
      });
    });
  }

  public removeReferenceFields(form: FormGroup, id: number): void {
    const arr = <FormArray>form.controls.references;
    arr.removeAt(id);
  }

  public scrollToInvalidFields(form: FormGroup): void {
    const scrollTo = (id) => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });

    if (form.get('references').invalid) {
      scrollTo('references');
    } else if (form.get('travelers').invalid) {
      scrollTo('travelers');
    }
  }

  public goToPreviousPage(filter: TransferFilter): void {
    this._transferService.search(filter).pipe(takeUntil(this._destroy$))
      .subscribe(() => this.navigateToTransferSearchResult());
  }

  private _getMobilePhoneValidators(i: number): ValidatorFn[] {
    return (i === 0) ? [Validators.required, Validators.pattern(Utils.phoneRegexp)] : null;
  }

  private _getEmailValidators(i: number): ValidatorFn[] {
    return (i === 0) ? [Validators.required, Validators.pattern(Utils.emailRegexp)] : [Validators.pattern(Utils.emailRegexp)];
  }

  private _getTransfer(): Observable<any> {
    const transferId = this._route.snapshot.queryParams.transferId;
    return this._transferService.getByVehicleId(transferId);
  }

}
