import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// models
import { BookingItem } from '../../../models/booking-item.model';

// enums
import { BookingType } from '../../../enums/booking-type';

@Component({
  selector: 'h21-bookings-order-payment-info',
  templateUrl: './bookings-order-payment-info.component.html',
  styleUrls: ['./bookings-order-payment-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsOrderPaymentInfoComponent {

  @Input() public order: BookingItem;

  public bookingTypes = BookingType;

  public trackByFn(index: number): number {
    return index;
  }

}
