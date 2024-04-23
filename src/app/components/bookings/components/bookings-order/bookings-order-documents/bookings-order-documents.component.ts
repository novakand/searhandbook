import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// models
import { BookingItem } from '../../../models/booking-item.model';

// enums
import { BookingDocumentType } from '../../../enums/booking-document-type';
import { BookingType } from '../../../enums/booking-type';

// services
import { BookingsListService } from '@components/bookings/components/bookings-list/bookings-list.service';

@Component({
  selector: 'h21-bookings-order-documents',
  templateUrl: './bookings-order-documents.component.html',
  styleUrls: ['./bookings-order-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsOrderDocumentsComponent {

  @Input() public order: BookingItem;

  public bookingTypes = BookingType;
  public documentType = BookingDocumentType;

  constructor(private _bookingsListService: BookingsListService) { }

  public onDownloadDocument(type: BookingDocumentType, order: BookingItem): void {
    this._bookingsListService.downloadDocument(type, order, true);
  }

  public onOpenLoadedDocument(type: BookingDocumentType, order: BookingItem): void {
    this._bookingsListService.downloadDocument(type, order, false);
  }

}
