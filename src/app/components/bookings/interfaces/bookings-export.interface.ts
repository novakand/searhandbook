import { BookingsFilterModel, MimeType } from '@components/bookings';

export interface IBookingsExport {
  groupByTrip: boolean;
  mimeType: MimeType;
  query: {
    order: Record<string, string | boolean>[];
    filter: BookingsFilterModel;
  };
  displayFields: Record<string, string>;
}
