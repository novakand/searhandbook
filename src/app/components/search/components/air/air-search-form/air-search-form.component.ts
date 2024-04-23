import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// external libs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// internal libs
import { H21DialogPanelService, IH21DialogPanel } from 'h21-be-ui-kit';

// interfaces
import { IAirSearchQuery, ITraveler } from '../../../interfaces/';

// components
import { TripRequestDialogComponent } from '../../trip-request-dialog';

@Component({
  selector: 'h21-air-search-form',
  templateUrl: './air-search-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AirSearchFormComponent implements OnInit {

  @Input() public selectedTravelers: ITraveler[];
  @Input() public booker: ITraveler;

  public form: FormGroup;
  public formFieldAppearance: string;
  public tripTypes: any;
  public classes: any;
  public query: IAirSearchQuery;

  private _destroy$ = new Subject<boolean>();

  constructor(private _router: Router,
              private _fb: FormBuilder,
              private _cdr: ChangeDetectorRef,
              private _dialogPanelService: H21DialogPanelService,
  ) {
    this._init();
    this._testInit();
  }

  public ngOnInit(): void {
    this._buildForm();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public addTrip(): void {
    this.query.trips.push({
      from: null,
      to: null,
      arrivalDate: null,
      departureDate: null,
    });
  }

  public deleteTrip(index: number): void {
    this.query.trips.splice(index, 1);
  }

  public openTripRequestDialog(): void {
    const panelData: IH21DialogPanel = {
      data: { },
    };

    panelData.data.overlay = this._dialogPanelService.open(TripRequestDialogComponent, panelData);
    panelData.data.overlay.detachments()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
        },
      });
  }

  public clear(): void {
    // clear form
  }

  public submit(): void {
    this._router.navigateByUrl('/search/air/result');
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      tripTypeId: new FormControl(this.query.tripTypeId, Validators.required),
      classId: new FormControl(this.query.classId, Validators.required),
      nonStopOnly: new FormControl(this.query.nonStopOnly, Validators.required),
    });
  }

  private _init(): void {
    this.formFieldAppearance = 'outline';
    this.selectedTravelers = [];
    this.tripTypes = [];
    this.classes = [];
    this.query = {
      trips: [
        {
          from: null,
          to: null,
          arrivalDate: null,
          departureDate: null,
        },
      ],
      tripTypeId: 1,
      classId: 1,
      nonStopOnly: true,
    };
  }

  private _testInit(): void {
    this.tripTypes = [
      { id: 1, name: 'Round trip' },
      { id: 2, name: 'One way' },
      { id: 3, name: 'Multytrip' },
    ];
    this.classes = [
      { id: 1, name: 'Economy' },
      { id: 2, name: 'Business' },
    ];
  }

}
