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
import { Subject } from 'rxjs';
// inner libs
import {
  DIALOG_PANEL_DATA,
  HttpClientService,
  IH21DialogPanel,
  IState,
} from 'h21-be-ui-kit';
// enums
import { AnimationState } from '@app/enums/animation-state';
// models
import { TripRequestFilter } from '../../models/trip-request-filter.model';
// animation
import { ToggleSlideAnimation } from '@app/animations';

@Component({
  selector: 'h21-trip-request-filter',
  templateUrl: './trip-request-filter.component.html',
  animations: [
    ToggleSlideAnimation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRequestFilterComponent implements AfterViewInit, OnDestroy, OnInit {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public formFieldAppearance: string;
  public form: FormGroup;

  @ViewChild('container') private _container: ElementRef;

  private _destroy$ = new Subject<boolean>();

  constructor(private _fb: FormBuilder,
              private _cdr: ChangeDetectorRef,
              private _http: HttpClientService,
              @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    this.formFieldAppearance = 'outline';
    this._buildForm();
  }

  public ngOnInit(): void {
    this.form.patchValue(this._dialogPanel.data.filter);
  }

  public ngAfterViewInit() {
    this._container.nativeElement.focus();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index) {
    return index;
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  public clear(): void {
    this.form.reset();
  }

  public submit(): void {
    this._dialogPanel.data.filter = new TripRequestFilter(this.form.value);
    this._dialogPanel.data.overlay.detach();
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      name: new FormControl(),
      departure: new FormControl(),
      arrival: new FormControl(),
      city: new FormControl(),
      pickUp: new FormControl(),
      dropDown: new FormControl(),
      from: new FormControl(),
      to: new FormControl(),
    });
  }

}
