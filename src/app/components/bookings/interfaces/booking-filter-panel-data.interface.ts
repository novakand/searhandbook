import { BookingsFilterModel } from '@components/bookings/models/bookings-filter.model';
import { OverlayRef } from '@angular/cdk/overlay';
import { PanelAction } from 'h21-be-ui-kit';

export interface IBookingFilterPanelData {
  filter: BookingsFilterModel;
  displayColumns: string[];
  overlay?: OverlayRef;
  action?: PanelAction;
}
