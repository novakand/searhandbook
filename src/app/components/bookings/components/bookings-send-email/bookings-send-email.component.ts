import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

// external libs
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { DIALOG_PANEL_DATA, IH21DialogPanel } from 'h21-be-ui-kit';

// animations
import { ToggleSlideAnimation, ToggleVisibilityAnimation } from '@app/animations';

// enums
import { AnimationState } from '@app/enums';

// models
import { BookingItem } from '@components/bookings/models';

// services
import { BookingsSendEmailService } from './bookings-send-email.service';

@Component({
  selector: 'h21-bookings-send-email',
  templateUrl: './bookings-send-email.component.html',
  animations: [
    ToggleSlideAnimation,
    ToggleVisibilityAnimation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [BookingsSendEmailService],
})
export class BookingsSendEmailComponent implements OnDestroy {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public pending: boolean;

  public form: FormGroup;
  public formFieldAppearance = 'outline';

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _fb: FormBuilder,
    private _service: BookingsSendEmailService,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    this._buildForm(this._dialogPanel.data.order);
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

  public send(): void {
    this.pending = true;
    const send$ = this._service.sendEmail(this.form.value).pipe(takeUntil(this._destroy$));
    send$.subscribe(() => {
      this.close();
      this.pending = false;
    });
  }

  private _buildForm(item: BookingItem): void {
    this.form = this._fb.group({
      email: new FormControl(),
      message: new FormControl(),
      data: this._fb.group({
        orderId: new FormControl(item.id),
        viewOrderNumber: new FormControl(item.viewOrderNumber),
      }),
    });
  }

}
