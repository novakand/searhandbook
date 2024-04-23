import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// external libs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// internal libs
import { LoadProgressService } from 'h21-be-ui-kit';

// services
import { ReportService } from '@core/services';
import { PaymentNavigateService } from '@shared/services';

// enums
import { SearchMode } from '@components/search/enums';

// interfaces
import { ITripSegment } from '@core/interfaces';

@Component({
  selector: 'h21-payment-success',
  templateUrl: './payment-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ReportService, PaymentNavigateService],
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {

  @Input() public tripId: number;
  public items$ = new Subject<any>();
  public itemTypes = SearchMode;
  public successText: string;
  public tripName: string;
  public hasHotel: boolean;
  public hasTransfer: boolean;
  public showProviderImg = true;
  public isTransfer: boolean = this._router.url.includes('transfer');

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _reportService: ReportService,
    private _loadProgressService: LoadProgressService,
    private _payVisionNavigate: PaymentNavigateService,
  ) {}

  public ngOnInit(): void {
    this._getTrip();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public onRedirectToPayVision(order: ITripSegment): void {
    this._payVisionNavigate.redirectToPayVision(order.type);
  }

  public onDownloadVoucher(order: ITripSegment): void {
    this._reportService.downloadVoucher(order, true);
  }

  public onDownloadBillingDetails(order: ITripSegment): void {
    this._reportService.downloadBillingDetails(order, true);
  }

  public trackByFn(index: number): number {
    return index;
  }

  private _setSuccessText(segments: ITripSegment[]): void {
    const hasExtras = segments.some((segment) => segment.hasExtras);
    this.successText = hasExtras ?
      `You have successfully completed the booking.\n
       We are making sure all the extras you requested are available.\n
       You will shortly receive an email with further information`
      : 'You have successfully completed the booking';
  }

  private _checkHasType(segments: ITripSegment[], type: SearchMode): boolean {
    return segments.some((segment) => segment.type === type);
  }

  private _getTrip(): void {
    const trip$ = this._reportService.getTrip(this.tripId)
      .pipe(
        takeUntil(this._destroy$),
      );
    trip$.subscribe((data) => {
      const { name, segments } = data;
      this._setSuccessText(segments);
      this.tripName = name;
      this.hasHotel = this._checkHasType(segments, SearchMode.hotel);
      this.hasTransfer = this._checkHasType(segments, SearchMode.transfer);
      this._reportService.addCancellationClass(segments);
      this._loadProgressService.hide(1);
      this.items$.next(segments);
    });
  }

}
