import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

// external libs
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// services
import { StorageService } from '@core/services';

// models
import { IHotelsInBatch } from '@components/bookings';

@Component({
  selector: 'h21-hotel-search-result-update-notification',
  templateUrl: './hotel-search-result-update-notification.component.html',
  styleUrls: [ './hotel-search-result-update-notification.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelSearchResultUpdateNotificationComponent implements OnInit, OnDestroy {

  public counter: number = this.data.counter;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private _snackRef: MatSnackBarRef<HotelSearchResultUpdateNotificationComponent>,
  ) { }

  public ngOnInit(): void {
    this._counterListener();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public close(): void {
    this._snackRef.dismiss();
  }

  private _counterListener(): void {
    const count$ = this._storage.hotelsInBatchData$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      );

    count$.subscribe((val: IHotelsInBatch[]) => {
      this.counter = this._storage.countHotelsToView(val);
      this._cdr.detectChanges();
    });
  }

}
