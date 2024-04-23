import { Injectable } from '@angular/core';

// services
import { ReportService, StorageService } from '@core/services';

import { BookingDocumentType, BookingType, CancellationStateType } from '../../enums';
import { BookingDictionary } from '../../constants';
import { IBookingListItem, IBookingListTrip } from '../../interfaces';
import { BookingsService } from '../../services';
import { ConfirmResult, H21DefaultDialogService, OrderState } from 'h21-be-ui-kit';
import * as moment from 'moment';

@Injectable()
export class BookingsListService {

  constructor(
    private _reportService: ReportService,
    private _bookingsService: BookingsService,
    private _dialogs: H21DefaultDialogService,
    private _confirmDialogueService: H21DefaultDialogService,
    private _storage: StorageService,
  ) {}

  public getPageIndex(): number {
    const pageState = this._storage.bookingsPageState$.getValue();
    return pageState ? pageState.pageIndex : 0;
  }

  public getPageSize(): number {
    const pageState = this._storage.bookingsPageState$.getValue();
    return pageState ? (pageState.pageSize || 10) : 10;
  }

  public updateTrip(tripList: IBookingListTrip[], updatedTrip: IBookingListTrip): void {
    const index = tripList.findIndex((trip) => trip.id === updatedTrip.id);
    tripList[index] = updatedTrip;
  }

  public downloadDocument<T>(type: BookingDocumentType, order: T, isSave: boolean): void {
    switch (type) {
      case BookingDocumentType.Voucher:
        this._reportService.downloadVoucher(order, isSave);
        break;
      case BookingDocumentType.BillingDetails:
        this._reportService.downloadBillingDetails(order, isSave);
        break;
    }
  }

  public cancel(item: IBookingListItem): void {
    this._dialogs.confirm('Cancel booking', 'Are you sure you want to cancel this booking?')
      .afterClosed()
      .subscribe((result) => {
        result === ConfirmResult.Yes && this._cancelOrder(item);
        result === ConfirmResult.No && this._bookingsService.canceled$.next();
      });
  }

  public fillBookingListItems(items: IBookingListItem[]): void {
    items.forEach((item) => {
      item.canCancel = this.getCanCancelField(item);
      item.cancellationMarkState = this._getCancellationMarkState(item);
      item.bookingType = this.getBookingType(item);
      item.dateFormat = this._getDateFormat(item);
    });
  }

  public getBookingType(item: IBookingListItem): BookingType {
    const bookingDictionary = new BookingDictionary();
    return bookingDictionary[item.typeId];
  }

  public getCanCancelField(item: IBookingListItem): boolean {
    const today = moment().utc();
    const { arrivalDate, orderStateId } = item;
    const cancelDay = moment(arrivalDate).utc().subtract(1, 'days');
    return moment(cancelDay).utc().isAfter(today) && (OrderState.New === orderStateId);
  }

  private _cancelOrder(item: IBookingListItem): void {
    const today = moment().utc();
    const penaltyDate = moment(item.cancelPenaltyDeadTime).utc();
    today.isAfter(penaltyDate) ? this._openCancelOrderDialogue(item) : this._bookingsService.sendCancelOrderRequest(item);
  }

  private _openCancelOrderDialogue(item: IBookingListItem): void {
    const message = `The booking ${item.viewOrderNumber} cannot be cancelled without penalty according to the cancellation policy`;
    const confirmDialogue = this._confirmDialogueService.confirm(null, message);

    confirmDialogue.afterClosed().subscribe((result) => result === ConfirmResult.Yes && this._bookingsService.sendCancelOrderRequest(item));
  }

  private _getDateFormat(item: IBookingListItem): string {
    return item.typeCode === BookingType.Transfer ? 'dd MMM yyyy HH:mm' : 'dd MMM yyyy';
  }

  private _getCancellationMarkState(booking: IBookingListItem): CancellationStateType {
    const { arrivalDate, cancelPenaltyDeadTime } = booking;
    const now = moment().utc();
    const penaltyDate = moment(cancelPenaltyDeadTime).utc();
    const arrival = moment(arrivalDate).utc();
    const penaltyDateDiff = penaltyDate.diff(now, 'days');

    if (!cancelPenaltyDeadTime && now.isSameOrBefore(arrivalDate)) {
      return CancellationStateType.non;
    }
    if (penaltyDateDiff > 0 && penaltyDateDiff <= 4) {
      return CancellationStateType.free;
    }
    if (cancelPenaltyDeadTime && now.isAfter(penaltyDate) && now.isSameOrBefore(arrival)) {
      return CancellationStateType.penalty;
    }
  }

}
