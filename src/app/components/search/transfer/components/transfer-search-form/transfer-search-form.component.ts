import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewRef,
} from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatAutocomplete, MatAutocompleteTrigger, MatDatepicker } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormGroup } from '@angular/forms';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// external libs
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import * as moment from 'moment';

// internal libs
import { DrawingModes, H21MapComponent, PlaceIconsType, Point, PointAddress, Position } from 'h21-map';
import { H21DialogPanelService, IH21DialogPanel } from 'h21-be-ui-kit';

// enums
import { SendRequestDialogType } from '@app/enums';
import { LocationType } from '../../enums';

// interfaces
import { IMarker, IRoute, ITraveler } from '../../../interfaces';

// models
import { Route, TransferFilter } from '../../models';

// services
import { TransferSearchService } from './transfer-search.service';
import { TransferService } from '../../services';

// components
import { SendRequestDialogComponent } from '@shared/components';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { PrimaryTravelerService } from '@search/services';

export const SB_DATE_FORMATS = {
  parse: {
    dateInput: 'D MMM YYYY',
  },
  display: {
    dateInput: 'D MMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'D MMM YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'h21-transfer-search-form',
  templateUrl: './transfer-search-form.component.html',
  styleUrls: [ './transfer-search-form.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PrimaryTravelerService,
    TransferSearchService,
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
})
export class TransferSearchFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public map: H21MapComponent;
  @Input() public marker: IMarker;
  @Input() public staticUrl: string;
  @Input() public booker: ITraveler;
  @Input() public position: Position;
  @Input() public selectedTravelers: ITraveler[] = [];

  @Output() public isRestore = new EventEmitter<boolean>();
  @Output() public routeReady = new EventEmitter<IRoute>();
  @Output() public pointChange = new EventEmitter<IMarker>();
  @Output() public drawMarker = new EventEmitter<DrawingModes>();

  public tabletMode: boolean;
  public isPending: boolean;
  public minDate = this._service.minDate;

  public form: FormGroup;
  public formFieldAppearance: MatFormFieldAppearance = 'outline';

  public point = LocationType;
  public iconType = PlaceIconsType;
  public currentPoint: LocationType;

  public pickUps$ = new Subject<Point[]>();
  public dropDowns$ = new Subject<Point[]>();
  public primaryTraveler: ITraveler;
  public travelers$: Observable<ITraveler[]>;

  public to: PointAddress;
  public from: PointAddress;

  public swapDisabled = false;

  public filterRoute = new Route();
  public filter = new TransferFilter({
    routes: [],
  });

  public timeDictionary: string[];
  public filteredTimeDictionary$: Observable<string[]>;

  public destroy$ = new Subject<boolean>();

  @ViewChild('searchText') private _searchText: ElementRef;
  @ViewChild('date') private _date: MatDatepicker<Date>;
  @ViewChild('timeAutoComplete', { read: MatAutocompleteTrigger }) private _timeAutoComplete: MatAutocompleteTrigger;

  constructor(
    private _zone: NgZone,
    private _cdr: ChangeDetectorRef,
    private _service: TransferSearchService,
    private _transferService: TransferService,
    private _breakpointObserver: BreakpointObserver,
    private _dialogPanelService: H21DialogPanelService,
    private _primaryTravelerService: PrimaryTravelerService,
  ) {
    this._service.cmp = this;
    this._service.buildForm();
  }

  public ngOnInit(): void {
    this._listenLayoutBreakpoint();
    this._listenResetPrimaryTraveler();
    this.travelers$ = this._primaryTravelerService.travelers$;
    this._primaryTravelerService.listenSearch();
    this._primaryTravelerService.listenSearchInput(this._searchText);
    this._setTimeDictionary();
    this._filterTimeList();
    this._correctTimeList();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes.position && changes.position.currentValue && this._service.getAddress(changes.position.currentValue);
    if (changes.marker && changes.marker.currentValue) {
      const marker: IMarker = changes.marker.currentValue;
      this.currentPoint = marker.point;
      this._service.getAddress({
        longitude: marker.longitude,
        latitude: marker.latitude,
      });
    }
    (changes.map && changes.map.currentValue) && this._mapListener();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this._service.clear();
    this._transferService.result$.next(null);
  }

  public trackByFn(index: number): number {
    return index;
  }

  public stopSwitchFocusByEnterPressed(event): void {
    event.preventDefault();
  }

  public onOpenDatepicker(event: MouseEvent): void {
    event.preventDefault();
    this._date.open();
  }

  public openSendRequestDialog(): void {
    if (this._service.isFormInvalid()) { return; }
    this._service.fillFilter();

    const panelData: IH21DialogPanel = { data: { filter: this.filter, type: SendRequestDialogType.TransferRequest } };
    panelData.data.overlay = this._dialogPanelService.open(SendRequestDialogComponent, panelData);
  }

  public clear(): void {
    this._service.clear();
    this.form.patchValue({ time: '' });
  }

  public submit(): void {
    this._service.submit();
  }

  public onSelect(prediction: Point, type: LocationType) { this._service.onSelect(prediction, type); }

  public onDateChange(): void {
    const control = this.form.get('time');
    if (control.value) {
      control.markAsTouched({ onlySelf: true });
      control.updateValueAndValidity({ onlySelf: true });
      this.form.updateValueAndValidity();
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }
  }

  public onLocationClick(type: LocationType): void {
    this.currentPoint = type;
    this.drawMarker.emit(DrawingModes.marker);
  }

  public displayFn(point?: Point): string {
    return point && point.name;
  }

  public onArrowEvent(event: KeyboardEvent, type: LocationType, element: MatAutocomplete): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const val = element._keyManager.activeItem.value;
      val && this.form.get(type).setValue(val);
    }
  }

  public swapTripPoints(): void {
    this.swapDisabled = true;
    this._service.swapTripPoint();
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();

    setTimeout(() => {
      this._zone.run(() => {
        this.swapDisabled = false;
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      });
    }, 2000);
  }

  public resetTripPoint(point: LocationType): void {
    this._service.resetTripPoint(point);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public resetTime(): void {
    this.form.get('time').reset();
    this.form.patchValue({ time: '' });
    setTimeout(() => this._timeAutoComplete.openPanel(), 0x0);
  }

  public travelersDisplayFn(traveler?: ITraveler): string {
    return traveler && `${traveler.firstName} ${traveler.lastName}`;
  }

  public resetPrimaryTraveler(): void {
    this.form.get('primaryTraveler').reset();
    this.form.get('primaryTraveler').enable();
    this.primaryTraveler = null;
  }

  public onBlurPrimaryTravelerInput(opened): void {
    if (!opened && !this.primaryTraveler) {
      this._primaryTravelerService.resetPrimaryTraveler(this.form);
    }
  }

  public onSetPrimaryTraveler(traveler: ITraveler): void {
    this.primaryTraveler = traveler;
    this.form.get('primaryTraveler').setValue(this.primaryTraveler);
    this.form.get('primaryTraveler').disable();
  }

  public onTravelersAutocompleteClose(): void {
    !this.primaryTraveler && this._primaryTravelerService.resetPrimaryTraveler(this.form);
  }

  private _mapListener(): void {
    const ready$ = this.map.load.pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    );
    ready$.subscribe(() => {
      this._service.restoreByFilter();
      this._service.setAutocomplete(this.pickUps$, LocationType.pickUp);
      this._service.setAutocomplete(this.dropDowns$, LocationType.dropDown);
    });
  }

  private _filterTimeList(): void {
    this.filteredTimeDictionary$ = this.form.get('time').valueChanges
      .pipe(
        startWith(''),
        map((value) => this._timeDictionaryFilter(value)),
        takeUntil(this.destroy$),
      );
  }

  private _correctTimeList(): void {
    this.form.get('date').valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this._setTimeDictionary(value);
        this.filteredTimeDictionary$ = of(this.timeDictionary);
      });
  }

  private _setTimeDictionary(chosen?: moment.Moment): void {
    const now = moment();
    const isUse = this._isUseDef(chosen, now);

    const dictionary = [];
    let minutes = this._getStartMinutes(now.minutes());
    for (let i = isUse ? now.hour() : 0x0; i < 0x18; i++) {
      for (let j = isUse ? minutes : 0x0; j < 0x6; j++) {
        dictionary.push(`${this._padLeft(i)}:${j}0`);
      }
      minutes !== 0x0 && (minutes = 0x0);
    }
    this.timeDictionary = dictionary;
  }

  private _timeDictionaryFilter(value: string): string[] {
    return this.timeDictionary.filter((time) => time.includes(value));
  }

  private _padLeft(n: number, size: number = 2): string {
    let result = n.toString();
    if (result.length < size) {
      result = `0${result}`;
    }
    return result;
  }

  private _isUseDef(chosen: moment.Moment, now: moment.Moment): boolean {
    if (chosen) {
      return chosen.diff(now, 'hours') < 0x18;
    }
    return false;
  }

  private _getStartMinutes(n: number): number {
    const result = n.toString();
    if (result.length === 0x2) {
      return +result.charAt(0x0) + 0x1;
    }
    return (+result >= 0x5 ? 0x0 : +result) + 0x1;
  }

  private _listenResetPrimaryTraveler(): void {
    this._primaryTravelerService.resetPrimaryTraveler$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.primaryTraveler = null);
  }

  private _listenLayoutBreakpoint(): void {
    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        this._cdr.markForCheck();
      });
  }

}
