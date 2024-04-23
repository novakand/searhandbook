import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// models
import { BookingItem } from '../../../models/booking-item.model';

@Component({
  selector: 'h21-bookings-order-info',
  templateUrl: './bookings-order-info.component.html',
  styleUrls: ['./bookings-order-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsOrderInfoComponent {

  @Input() public order: BookingItem;

}
