import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// external libs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// internal libs
import { H21DialogPanelService, IH21DialogPanel } from 'h21-be-ui-kit';

// interfaces
import { ITrainSearchQuery, ITraveler } from '../../../interfaces/';

// components
import { TripRequestDialogComponent } from '../../trip-request-dialog';

@Component({
  selector: 'h21-train-search-form',
  templateUrl: './train-search-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainSearchFormComponent implements OnInit {

  @Input() public selectedTravelers: ITraveler[];
  @Input() public booker: ITraveler;

  public form: FormGroup;
  public formFieldAppearance: string;
  public departDate: Date;
  public returnDate: Date;
  public query: ITrainSearchQuery;

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

  public onSelectDepartDate($event): void {
    this.departDate = $event;
  }

  public onSelectReturnDate($event): void {
    this.returnDate = $event;
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
    this._router.navigateByUrl('/search/train/result');
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      return: new FormControl(this.query.return),
      from: new FormControl(this.query.from, Validators.required),
      to: new FormControl(this.query.to, Validators.required),
      departTime: new FormControl(this.query.to, Validators.required),
      returnTime: new FormControl(this.query.to, Validators.required),
      via: new FormControl(this.query.via),
    });
  }

  private _init(): void {
    this.formFieldAppearance = 'outline';
    this.selectedTravelers = [];
    this.query = {
      return: true,
      from: null,
      to: null,
      departDate: null,
      departTime: null,
      returnDate: null,
      returnTime: null,
      via: null,
    };
  }

  private _testInit(): void {

  }

}
