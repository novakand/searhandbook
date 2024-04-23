import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatAutocomplete } from '@angular/material';

// external libs
import { filter, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';
import { BehaviorSubject, Observable, range, Subject } from 'rxjs';

// internal libs
import {
  ChangesMap,
  CircleEvent,
  DrawingModes,
  H21MapComponent,
  PlaceIconsType,
  Point,
  Position,
} from 'h21-map';

import {
  H21CounterComponent,
  H21DialogPanelService,
  H21TwoMonthCalendarComponent,
  IH21DialogPanel,
  Query,
} from 'h21-be-ui-kit';

// interfaces
import { IDrawingOptions, IMarker, ITraveler } from '@search/interfaces';

// models
import { HotelFilter, HotelGeneralInfoFilter, Marker } from '@hotel/models';
import { DrawAreaInfo } from '@search/models/draw-area-info.model';
import { MarkerActionInfo } from '@search/models';

// services
import { SearchMapService } from '@search/components/search/services/search-map.service';
import { PoiService } from '@hotel/components/hotel-poi/poi.service';
import { HotelSearchService } from './hotel-search.service';
import { HotelGeneralInfoService } from '@hotel/services';
import { PrimaryTravelerService } from '@search/services';

// components
import { SendRequestDialogComponent } from '@shared/components';

// enums
import { DrawType, PointType } from '@hotel/enums';
import { SendRequestDialogType } from '@app/enums';
import { MarkerAction } from '@search/enums';

// builder
import { HotelSearchBuilder } from './hotel-search.builder';
import { buildMarker } from './hotel-poi-marker.builder';

@Component({
  selector: 'h21-hotel-search-form',
  templateUrl: './hotel-search-form.component.html',
  styleUrls: [ './hotel-search-form.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HotelSearchService, PoiService, PrimaryTravelerService],
})
export class HotelSearchFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public drawInfo: DrawAreaInfo;
  @Input() public circleChange: CircleEvent;
  @Input() public currentDrawMode: DrawingModes;
  @Input() public marker: IMarker;
  @Input() public position: Position;
  @Input() public map: H21MapComponent;
  @Input() public drawingOptions: IDrawingOptions;

  @Output() public isRestore = new EventEmitter<boolean>();
  @Output() public clearByType = new EventEmitter<PointType>();
  @Output() public pointChange = new EventEmitter<IMarker[]>();
  @Output() public drawingOptionsChange = new EventEmitter<IDrawingOptions>();
  @Output() public trackMapCluster = new EventEmitter<ChangesMap>();
  @Output() public clearForm = new EventEmitter<void>();
  @Output() public changeDestination = new EventEmitter<void>();
  @Output() public setMarkers = new EventEmitter<MarkerActionInfo>();
  @Output() public resetPoi = new EventEmitter<void>();

  @ViewChild('counter') public counter: H21CounterComponent;
  @ViewChild('calendar') public calendar: H21TwoMonthCalendarComponent;

  public tabletMode: boolean;
  public form: FormGroup;
  public iconType = PlaceIconsType;
  public formFieldAppearance: MatFormFieldAppearance = 'outline';
  public filter = new HotelFilter({
    amountOfRooms: 1,
    adultsPerRoom: 1,
    children: [],
  });
  public pending$ = new Subject<boolean>();
  public ages$ = range(0, 17).pipe(toArray());
  public primaryTraveler: ITraveler;
  public destinations$ = new BehaviorSubject([]);
  public markers: Marker[] = [];
  public travelers$ = this._primaryTravelerService.travelers$;

  public countOfHotel$: Observable<number>;

  @ViewChild('searchText') private _searchText: ElementRef;
  private _destroy$ = new Subject<boolean>();

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    private _poiService: PoiService,
    private _service: HotelSearchService,
    @Inject('window') private _window: Window,
    private _searchMapService: SearchMapService,
    private _dialogPanelService: H21DialogPanelService,
    private _generalInfoService: HotelGeneralInfoService,
    private _breakpointObserver: BreakpointObserver,
    private _primaryTravelerService: PrimaryTravelerService,
  ) {
    this._service.cmp = this;
    this.form = HotelSearchBuilder.buildForm(this.fb);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.drawInfo && changes.drawInfo.currentValue) {
      this._onDrawInfo();
    }
    changes.currentDrawMode && this._service.resetTripPoint(false);
  }

  public ngOnInit(): void {
    this._listenLayoutBreakpoint();
    this._listenResetPrimaryTraveler();
    this._primaryTravelerService.listenSearch();
    this._primaryTravelerService.listenSearchInput(this._searchText);
    this._service.setDestinationAutocomplete();
    this._mapReadyListener();
    this._onPoiClick();
  }

  public ngOnDestroy(): void {
    this._resetDrawMode();
    this._destroy$.next(true);
    this._destroy$.complete();
    this.pending$.next(true);
    this.pending$.complete();
    this.resetPoi.emit();
  }

  public trackByFn(index: number): number { return index; }

  public onSetFormDate(controlName: string, date: Date): void {
    this.form.controls[controlName].setValue(date);
  }

  public checkControls(): void {
    this._checkControl('destination');
  }

  public submit(): void {
    this.checkControls();
    if (this._isInvalid()) {
      return;
    }
    this._fillFilter();
    this._service.submit(this.filter);
  }

  public openSendRequestDialog(): void {
    this.checkControls();
    if (this._isInvalid()) { return; }
    if (typeof this.form.get('destination').value !== 'string') {
      this._fillFilter();
      const panelData: IH21DialogPanel = { data: { filter: this.filter, type: SendRequestDialogType.HotelRequest } };
      panelData.data.overlay = this._dialogPanelService.open(SendRequestDialogComponent, panelData);
    }
  }

  public clear(): void {
    this._service.clear();
    this.calendar.clear();
    this.filter = new HotelFilter({
      amountOfRooms: 1,
      adultsPerRoom: 1,
      children: [],
    });
    this.counter && (this.counter.value = 0);
    this._resetDrawMode();
  }

  public onSelect(prediction: Point) {
    this._service.onSelect(prediction);
  }

  public onArrowEvent(event: KeyboardEvent, element: MatAutocomplete): void {
    if (!this.form.get('destination').value) { return; }
    this.changeDestination.emit();
    this.form.get('destination').value.length === 1 && this._resetDrawMode();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const val = element._keyManager.activeItem.value;
      val && this.form.get('destination').setValue(val);
    }
  }

  public resetLocation(): void {
    this.map.manager.getMap().markerCluster.clearMarkerCluster();
    this._service.resetTripPoint(true);
    this._resetDrawMode();
  }

  public destinationsDisplayFn(point?: Point): string {
    return point && point.name;
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

  private _mapReadyListener(): void {
    const mapReady$ = this.map.load.pipe(filter(Boolean), takeUntil(this._destroy$));
    mapReady$.subscribe(() => {
      this._service.restoreForm();
      this._loadPoi();
      this._service.loadProgressMarkerCluster();
      this.countOfHotel$ = this.map.manager.getMap().markerCluster.countLoadMarkers$;
    });
  }

  private _onPoiClick(): void {
    const destination$ = this._searchMapService.destination$
      .pipe(
        tap(() => this.filter.drawInfo = null),
        tap((destination) => this.form.get('destination').setValue(destination.dataPoint)),
        switchMap((destination) => this._generalInfoService.findById(+destination.dataPoint.id)),
        takeUntil(this._destroy$),
      );
    destination$.subscribe((point) => this._onAfterPoiClick(point));
  }

  private _onAfterPoiClick(point: Point): void {
    this.destinations$.next([point]);
    this._service.drawArea(point);
    this._setZoomByPoint(point);
  }

  private _setZoomByPoint(point: Point): void {
    const { latitude, longitude } = point.position;
    point.subtype === 'poi' && this.map.manager.getMap().setCenter(latitude, longitude, 13);
  }

  private _loadPoi(): void {
    this._poiService.postQueryWithPoint(
      new Query<HotelGeneralInfoFilter>({
        filter: new HotelGeneralInfoFilter({ nameOrAddressContains: null }),
      }),
    ).pipe(takeUntil(this._destroy$))
      .subscribe((points) => this._setPoi(points));
  }

  private _setPoi(points: Point[]): void {
    this.markers = points.map(buildMarker);
    this.setMarkers.emit(new MarkerActionInfo({
      markers: this.markers,
      action: MarkerAction.CLEAR_AND_ADD,
    }));
  }

  private _onDrawInfo(): void {
    this.filter.drawInfo = this.drawInfo;
    if (DrawType.area === this.drawInfo.type) {
      this._service.filterByArea(this.drawInfo);
    } else {
      this.drawInfo.circle.radius = Math.ceil(this.drawInfo.circle.radius);
      this._service.filterByRadius(this.drawInfo.circle);
    }
  }

  private _resetDrawMode(): void {
    this.filter.drawInfo = null;
    this.map.manager.getMap() && this.map.manager.getMap().drawing.remove();
    this.trackMapCluster.emit(ChangesMap.bbox);
    this.clearForm.emit();
  }

  private _checkControl(control: string): void {
    const val = this.form.get(control).value;
    if (typeof val === 'string' && val !== '') {
      this.form.get(control).setErrors({ invalid: true });
      this.cdr.detectChanges();
    }
  }

  private _isInvalid(): boolean {
    this._validate();
    this.calendar.validate();
    return this.form.invalid;
  }

  private _fillFilter(): void {
    const built = HotelSearchBuilder.buildFilter(this.form, this.drawInfo);
    this.filter = { ...this.filter, ...built };
  }

  private _validate(): void {
    Object.keys(this.form.controls).forEach((control) => {
      if (this.form.controls[control] instanceof FormControl) {
        this.form.controls[control].markAsTouched();
      } else if (this.form.controls[control] instanceof FormArray) {
        this.form.controls[control].updateValueAndValidity();
        (<FormArray>this.form.controls[control]).controls.forEach((group: FormGroup) => {
          group.get('age').markAsTouched();
        });
      }
    });
  }

  private _listenResetPrimaryTraveler(): void {
    this._primaryTravelerService.resetPrimaryTraveler$.pipe(takeUntil(this._destroy$))
      .subscribe(() => this.primaryTraveler = null);
  }

  private _listenLayoutBreakpoint(): void {
    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        this.cdr.markForCheck();
      });
  }

}
