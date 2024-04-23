import { Injectable } from '@angular/core';
import { INotify } from '@core/interfaces';

// external libs
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

// inner libs
import { ISignalrContext, SignalrService } from 'h21-be-ui-kit';

// interfaces
import { IBookNotification, IOrderNotification, ISearchNotification } from '@components/search/transfer/interfaces';
import { IOrderResult } from '@components/search/hotel/components/hotel-order/reference.interface';

@Injectable()
export class NotificationSignalRService {

  get searchResult$() { return this._searchResult$; }
  get paymentResult$() { return this._paymentResult$.asObservable(); }
  get orderCreate$() { return this._orderCreate$.asObservable(); }
  get orderCreateError$() { return this._orderCreateError$.asObservable(); }
  get bookResult$() { return this._bookResult$.asObservable(); }
  get notify$() { return this._notify$.asObservable(); }
  get orderCancel$() { return this._orderCancel$.asObservable(); }
  get cancellationPolicy$() { return this._cancellationPolicy$.asObservable(); }
  get updateCancellationPolicy$() { return this._updateCancellationPolicy$.asObservable(); }
  get verificationService$() { return this._verificationService$.asObservable(); }

  private _notify$ = new Subject<INotify>();
  private _orderCreate$ = new Subject<number>();
  private _orderCreateError$ = new Subject<number>();
  private _orderCancel$ = new Subject<number>();
  private _bookResult$ = new Subject<IOrderResult>();
  private _paymentResult$ = new Subject<IBookNotification>();
  private _cancellationPolicy$ = new Subject<any>();
  private _updateCancellationPolicy$ = new Subject<IBookNotification>();
  private _verificationService$ = new Subject<IOrderResult>();
  private _searchResult$ = new BehaviorSubject<ISearchNotification>(null);

  constructor(private _signal: SignalrService) {
    this._onBookResult();
    this._onOrderCreate();
    this._onNotification();
    this._onPaymentResult();
    this._onSearchResult();
    this._onCancellationPolicy();
    this._onVerificationService();
    this._updateCancellationPolicy();
  }

  get context(): ISignalrContext {
    return this._signal.context;
  }

  get contextResolved(): ReplaySubject<boolean> {
    return this._signal.contextResolved;
  }

  public setUser(login: string): void {
    this._signal.invoke('SetUser', login);
  }

  private _onNotification() {
    this._signal.on('searchandbooknotify', (notification: INotify) => {
      this._notify$.next(notification);
    });
  }

  private _onSearchResult() {
    this._signal.on('searchResult', (notification: ISearchNotification) => {
      this._searchResult$.next(notification);
    });
  }

  private _onCancellationPolicy() {
    this._signal.on('showroomdetails', (notification: any) => {
      this._cancellationPolicy$.next(notification);
    });
  }

  private _updateCancellationPolicy() {
    this._signal.on('getcancellationpolicy', (notification: IBookNotification) => {
      this._updateCancellationPolicy$.next(notification);
    });
  }

  private _onVerificationService() {
    this._signal.on('verificationservice', (notification: any) => {
      this._verificationService$.next(notification);
    });
  }

  private _onOrderCreate() {
    this._signal.on('createorder', (notification: IOrderNotification) => {
      this._orderCreate$.next(notification.tripId);
    });

    this._signal.on('createordererror', (notification: IOrderNotification) => {
      if (notification.message) {
        this._orderCreateError$.next();
        this._notify$.next({ message: notification.message });
      }
    });

    this._signal.on('cancelservice', (notification: IOrderNotification) => {
      const { orderItemId, message } = notification;
      orderItemId && this._orderCancel$.next(orderItemId);
      message && this._notify$.next({ message: message });
    });
  }

  private _onBookResult() {
    this._signal.on('bookservice', (notification: IOrderResult) => {
      this._bookResult$.next(notification);
    });
  }

  private _onPaymentResult() {
    this._signal.on('paymentservice', (notification: IBookNotification) => {
      this._paymentResult$.next(notification);
    });
  }

}
