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
  ViewRef
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// external libs
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { DIALOG_PANEL_DATA, IH21DialogPanel } from 'h21-be-ui-kit';

// animations
import { ToggleVisibilityAnimation } from '@animation/toggle-visibility';
import { ToggleSlideAnimation } from '@animation/toggle-slide';

// enums
import { AnimationState } from '@app/enums/animation-state';
import { SearchMode as QueryType } from '../../enums';

// models
import { TripInfo, TripRequest } from '@components/search/models';

// environment
import { environment } from '@environments/environment';

@Component({
  selector: 'h21-trip-request-dialog',
  templateUrl: './trip-request-dialog.component.html',
  animations: [
    ToggleSlideAnimation,
    ToggleVisibilityAnimation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRequestDialogComponent implements AfterViewInit, OnDestroy, OnInit {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public queryTypeType = QueryType;
  public data: TripInfo[] = this._dialogPanel.data.trips;

  public form: FormGroup;
  public formFieldAppearance = 'outline';

  public loadInProgress: boolean;
  public actionInProgress: boolean;
  public noProgress: boolean;
  public noResultText = 'Nothing found';

  private _destroy$ = new Subject<boolean>();

  @ViewChild('container') private _container: ElementRef;

  constructor(
    private _fb: FormBuilder,
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    this._buildForm();
  }

  public ngAfterViewInit() {
    this._container.nativeElement.focus();
  }

  public ngOnInit(): void {
    this.noProgress = !this.data || !this.data.length;
  }

  public ngOnDestroy(): void {
    this.close();
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public remove(type: QueryType): void {
    const index = this.data.findIndex((e) => e.type === type);
    this.data.splice(index, 1);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public trackByFn(index) {
    return index;
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

  public save(): void {
    const request = new TripRequest({
      requestName: this.form.get('requestName').value,
      travelerIds: this._dialogPanel.data.travelers.map((traveler) => traveler.id),
    });
    this.data.forEach((data) => this._addTripRequestData(data, request));

    this._http.post(`${environment.core.connectorApi}TripRequestApi/Save`, request)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => this.close(),
        error: () => this.close(),
      });
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      requestName: new FormControl(null, Validators.required),
    });
  }

  private _addTripRequestData(tripInfo: TripInfo, tripRequest: TripRequest): void {
    switch (tripInfo.type) {
      case this.queryTypeType.transfer:
        tripRequest.tripRequestTransfer = tripInfo.trip;
        break;
      case this.queryTypeType.hotel:
        tripRequest.tripRequestHotel = tripInfo.trip;
        break;
      default:
        break;
    }
  }

}
