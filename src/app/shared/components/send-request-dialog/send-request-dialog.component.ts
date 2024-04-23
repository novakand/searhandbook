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
  ViewRef,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// external libs
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { DIALOG_PANEL_DATA, IH21DialogPanel, Utils } from 'h21-be-ui-kit';

// environment
import { ToggleSlideAnimation } from '@animation/toggle-slide';

// enums
import { AnimationState } from '@app/enums/animation-state';

// environment
import { environment } from '@environments/environment';

// services
import { ShareSearchRequestService } from '@components/search/hotel/services';

// models
import { ShareTrip } from '@components/bookings/components/bookings-list/bookings-list-trips/share-trip.model';
import { HotelFilter } from '@components/search/hotel';

// enums
import { SearchKind, SendRequestDialogType } from '@app/enums';

@Component({
  selector: 'h21-send-request-dialog',
  templateUrl: './send-request-dialog.component.html',
  animations: [ ToggleSlideAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ShareSearchRequestService],
})
export class SendRequestDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();
  public inProgress: boolean;
  public formFieldAppearance = 'outline';
  public title = 'Send request to email';
  public alertMessage = 'Please note that your recipient should be registered in the system to be able to work with this request';
  public form: FormGroup;
  public linkControl = new FormControl();

  private readonly _filter: HotelFilter;
  private _destroy$ = new Subject<boolean>();

  @ViewChild('container') private _container: ElementRef;
  @ViewChild('linkInput') private _linkInput: ElementRef;

  constructor(
    private _fb: FormBuilder,
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef,
    private _service: ShareSearchRequestService,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    if (this._dialogPanel.data.type !== SendRequestDialogType.ShareTrip) {
      this._filter = this._dialogPanel.data.filter;
    }
  }

  public ngOnInit(): void {
    if (this._dialogPanel.data.type === SendRequestDialogType.ShareTrip) {
      this.title = 'Share trip';
      this.alertMessage = this._getShareTripAlertMessage();
    }
    this._buildForm();
  }

  public ngAfterViewInit(): void {
    this._container.nativeElement.focus();
  }

  public ngOnDestroy(): void {
    this.close();
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public copyLink(): void {
    if (this._dialogPanel.data.type === SendRequestDialogType.ShareTrip) {
      this.linkControl.setValue(this._dialogPanel.data.link);
      this._copyToClipboard();
      return ;
    }

    this.inProgress = true;
    this.form.disable();

    const searchKind = this._getSearchKind();
    const link$ = this._service.getLink(this._filter, searchKind);

    link$.subscribe((link) => {
      this.linkControl.setValue(link);

      this._copyToClipboard();
      this.close();

      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  public onSubmit(): void {
    this.form.valid && this._send();
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  private _send(): void {
    this.inProgress = true;
    this.form.disable();

    const isShareTrip = this._dialogPanel.data.type === SendRequestDialogType.ShareTrip;
    const url = isShareTrip ? 'ShareTrip/SendEmail' : 'ShareSearchRequest/SendEmail';
    const body = isShareTrip ? this._buildShareTripInfo() : this._buildInfo();

    const send$ = this._http.post<void>(`${environment.apiGatewayUri}${url}`, body).pipe(takeUntil(this._destroy$));

    send$.subscribe(() => this.close());
  }

  private _buildInfo() {
    const { poi, ...noPoi } = this._filter;

    const searchKind = this._getSearchKind();
    const info = {
      ...this.form.value,
      data: { searchKind, hotel: null, transfer: null, },
    };
    searchKind === SearchKind.transfer && (info.data.transfer = this._filter);
    searchKind === SearchKind.hotel && (info.data.hotel = { ...noPoi });
    return info;
  }

  private _buildShareTripInfo(): ShareTrip {
    const { link, trip: { id, name } } = this._dialogPanel.data;
    return new ShareTrip({
      ...this.form.value,
      data: {
        tripId: id,
        tripName: name || '',
        tripLink: link,
      },
    });
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      email: [ null, [ Validators.required, Validators.pattern(Utils.emailRegexp) ]],
      message: [ null ],
    });
  }

  private _copyToClipboard(): void {
    this._linkInput.nativeElement.select();
    document.execCommand('copy');
    this._linkInput.nativeElement.setSelectionRange(0, 0);
  }

  private _getShareTripAlertMessage(): string {
    return 'Please note that your recipient should be registered in the system to have an access to travellers personal data';
  }

  private _getSearchKind(): SearchKind {
    return this._dialogPanel.data.type === SendRequestDialogType.HotelRequest ? SearchKind.hotel : SearchKind.transfer;
  }

}
