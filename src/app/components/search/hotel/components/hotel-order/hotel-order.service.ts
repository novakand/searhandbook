import { ChangeDetectorRef, Injectable, OnDestroy, ViewRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// external libs
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import * as moment from 'moment';

// internal libs
import { ConfirmResult, H21DefaultDialogService, ICodeNamedEntity, IH21DialogPanel, ReferencesService, Utils } from 'h21-be-ui-kit';

// environment
import { environment } from '@environments/environment';

// services
import { HotelGeneralInfoService } from '@hotel/services';

// interfaces
import { IRoomDescription } from '@hotel/interfaces';
import { IBookOrder, ITraveler } from '@components/search';
import { ICompanyReference } from '@core/interfaces';

// enums
import { ReferenceType } from '@hotel/enums';

@Injectable()
export class HotelOrderService implements OnDestroy {

  private _countries: ICodeNamedEntity[] = [];
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _fb: FormBuilder,
    private _http: HttpClient,
    private _router: Router,
    private _route: ActivatedRoute,
    private _service: HotelGeneralInfoService,
    private _dialogs: H21DefaultDialogService,
    private _references: ReferencesService,
  ) { }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public getCountries(): Observable<any> {
    return this._references.getCountries()
      .pipe(
        map((list) => list.sort((n1, n2) => n1.name > n2.name ? 1 : -1)),
        tap((countries) => this._countries = countries),
        takeUntil(this._destroy$),
      );
  }

  public fillTrip(panelData: IH21DialogPanel, form: FormGroup, cd: ChangeDetectorRef): void {
    const selectedTrip = panelData.data.selectedTrip;
    selectedTrip && form.get('trip').patchValue(selectedTrip);
    !(<ViewRef>cd).destroyed && cd.detectChanges();
  }

  public addToSelectedTravelers(form: FormGroup, index: number, traveler, selectedTravelers: ITraveler[]): void {
    traveler.country = this._countries.find(({ code }) => code === traveler.countryCode);
    (<FormArray>form.get('travelers')).controls[index].patchValue(traveler);
    selectedTravelers.push(traveler);
  }

  public listenNonRefundableDialogResult(): Observable<boolean> {
    return this._dialogs.confirm('Book', 'Are you sure you want to book?').afterClosed()
      .pipe(
        filter((result) => result === ConfirmResult.Yes),
        takeUntil(this._destroy$),
      );
  }

  public getOriginalTripName(info: IRoomDescription): string {
    const format = this.setDateFormat;
    const dates = `${format(info.searchParam.arrival)} - ${format(info.searchParam.departure)}`;
    return `${info.searchParam.destination || ''} ${dates}`;
  }

  public getHotelDescription(hotelId: string, connectionId: string): void {
    this._service.getHotelDescription(hotelId, connectionId).pipe(takeUntil(this._destroy$)).subscribe();
  }

  public getHotelInfo(responseId: string): Observable<IRoomDescription> {
    return this._service.getHotelInfo(responseId);
  }

  public bookRoom(order: IBookOrder): Observable<void> {
    return this._http.post<void>(`${environment.apiOrderUri}hotel/Booking/Room`, order)
      .pipe(takeUntil(this._destroy$));
  }

  public setDateFormat(date: string): string {
    return moment(date.substr(0, 10)).format('DD.MM.YYYY');
  }

  public validateList(form: FormGroup, name: string): void {
    (<FormArray>form.get(name)).controls.forEach((v, i) => {
      Object.keys((<FormGroup>(<FormArray>form.get(name)).at(i)).controls).forEach((z) => {
        (<FormArray>form.get(name)).at(i).get(z).updateValueAndValidity();
        (<FormArray>form.get(name)).at(i).get(z).markAsTouched();
      });
    });
  }

  public buildForm(connectionId: string): FormGroup {
    return this._fb.group({
      connectionId: new FormControl(connectionId),
      trip: this._fb.group({ id: new FormControl(), description: new FormControl(), name: new FormControl(), }),
      comment: new FormControl(),
      primaryTravelerIndex: new FormControl(0),
      travelers: this._fb.array([]),
      references: this._fb.array([]),
      paymentMethod: new FormControl(),
      unitId: new FormControl(),
    });
  }

  public buildFormData(form: FormGroup): IBookOrder {
    const data = Utils.deepCopy(form.getRawValue());
    data.references = data.references.map((reference) => {
      reference.id = null;
      return reference;
    });
    data.travelers = data.travelers.map((traveler) => {
      traveler.travelerId = traveler.id;
      traveler.id = null;
      traveler.country = (traveler.country && traveler.country.code) ? traveler.country.code : traveler.country;
      traveler.city = (traveler.city && traveler.city.code) ? traveler.city.code : traveler.city;
      return traveler;
    });
    return data;
  }

  public getHotelId(): string {
    return this._route.snapshot.queryParams.hotel;
  }

  public toggleFieldValidators(field: FormControl, required: boolean = false, email: boolean = false): void {
    if (required && email) {
      field.setValidators([Validators.required, Validators.pattern(Utils.emailRegexp)]);
    } else if (required) {
      field.setValidators(Validators.required);
    } else if (email) {
      field.setValidators(Validators.pattern(Utils.emailRegexp));
    } else {
      field.clearValidators();
    }
    field.updateValueAndValidity();
    field.markAsUntouched();
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

  public addTravelerFields(form: FormGroup, count: number): void {
    for (let i = 0; i < count; i++) {
      (<FormArray>form.get('travelers')).controls.push(
        this._fb.group({
          id: new FormControl(),
          lastName: new FormControl(null, Validators.required),
          firstName: new FormControl(null, Validators.required),
          email: new FormControl(null, (i === 0)
            ? [Validators.pattern(Utils.emailRegexp), Validators.required]
            : [Validators.pattern(Utils.emailRegexp)]),
          country: new FormControl(null),
          countryCode: new FormControl(null),
          isPrimary: new FormControl(i === 0),
          mobilePhone: new FormControl(),
          orderItemId: new FormControl(),
          travelerId: new FormControl(),
          customerCompanyProfileId: new FormControl(),
          customerCompanyName: new FormControl(),
        })); }
  }

}
