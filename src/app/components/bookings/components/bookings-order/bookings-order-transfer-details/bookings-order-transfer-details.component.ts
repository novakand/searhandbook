import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// internal libraries
import { BookingItem } from '../../../models';

@Component({
  selector: 'h21-bookings-order-transfer-details',
  templateUrl: './bookings-order-transfer-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsOrderTransferDetailsComponent {

  @Input() public order: BookingItem;

}
