import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewRef
} from '@angular/core';

// external libs
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// moment
import * as moment from 'moment';

// interfaces
import { IRoomRate } from '@hotel/interfaces';

// services
import { NotificationSignalRService, StorageService } from '@core/services';

@Component({
  selector: 'h21-hotel-rooms-list-item',
  templateUrl: './hotel-rooms-list-item.component.html',
  styleUrls: [ './hotel-rooms-list-item.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelRoomsListItemComponent implements OnInit, OnDestroy {

  @Input() public item: IRoomRate;

  public providerColor: string;
  public showProviderImg = true;
  public isAfter: boolean;
  public nonRefundableTooltip = 'You won\'t be able to use Pay later option for this booking';

  private _destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _store: StorageService,
    private _cdr: ChangeDetectorRef,
    private _notify: NotificationSignalRService,
  ) { }

  public ngOnInit(): void {
    this.isAfter = moment().utc().isSameOrAfter(this.item.penaltyDate);

    const cancel$ = this._notify.updateCancellationPolicy$
      .pipe(
        filter((notify) => notify.roomId === this.item.id),
        takeUntil(this._destroy$),
      );
    cancel$.subscribe((data) => {
      this.item.penaltyDate = data.penaltyDate;
      this.item.isRefundable = data.isRefundable;
      this.item.isAllowedToBook = data.isRefundable || this.item.isAllowedToBook;
      this.isAfter = moment().utc().isSameOrAfter(this.item.penaltyDate);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

}
