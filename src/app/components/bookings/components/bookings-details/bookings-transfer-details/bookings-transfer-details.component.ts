import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

// interfaces
import { IBookingsTransferDetail } from '../../../interfaces';

@Component({
  selector: 'h21-bookings-transfer-details',
  templateUrl: './bookings-transfer-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
 })
export class BookingsTransferDetailsComponent implements OnInit {

  @Input() public data: IBookingsTransferDetail;

  constructor() { }

  public ngOnInit(): void { }

}
