import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, } from '@angular/core';

// external libraries
import { Subject } from 'rxjs';

// internal libraries
import { BookingItem } from '../../../models';

@Component({
  selector: 'h21-bookings-order-hotel-details',
  templateUrl: './bookings-order-hotel-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsOrderHotelDetailsComponent implements OnDestroy, OnInit {

  @Input() public order: BookingItem;

  private _destroy$ = new Subject<boolean>();

  constructor(private _cdr: ChangeDetectorRef) { }

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

}
