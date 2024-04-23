import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// models
import { BookingItem } from '../../../models';
import { BookingType } from '../../../enums';

@Component({
  selector: 'h21-bookings-order-travelers',
  templateUrl: './bookings-order-travelers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
 })
export class BookingsOrderTravelersComponent {

  @Input() public order: BookingItem;
  public bookingTypes = BookingType;

  public trackByFn(index: number): number {
    return index;
  }

}
