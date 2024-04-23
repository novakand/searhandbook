import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// external libs
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, pluck } from 'rxjs/operators';

// internal libs
import {
  HttpClientService,
  IH21DialogPanel,
  IOrder,
  IQueryResult,
  Query,
  SignalrService,
  ToolbarActionsService,
  UtilsService,
} from 'h21-be-ui-kit';

// interfaces
import {
  IBookingFilterPanelData,
  IBookingItem,
  IBookingListItem,
  IBookingsExport,
  IBookingsFilter,
  IBookingTrip,
  IDictionaryItem,
} from '../interfaces';

// environment
import { environment } from '@environments/environment';

// models
import { BookingItem, BookingsFilterModel, TripRename } from '../models';

// services
import { NotificationSignalRService } from '@core/services';

@Injectable()
export class BookingsService {

  public bookingsFilter$ = new BehaviorSubject<BookingsFilterModel>(null);
  public canceled$: Subject<void> = new Subject<void>();

  private _orderItemController = 'OrderItem/';
  private _tripController = 'Trip/';

  constructor(
    private _http: HttpClientService,
    private _router: Router,
    private _notification: SignalrService,
    private _notify: NotificationSignalRService,
    private _utils: UtilsService,
    private _toolbarActionsService: ToolbarActionsService,
  ) {}

  public onOpenBookingDetails(order: IBookingListItem): void {
    const selection = window.getSelection();
    const isNoCopy = selection.toString().length === 0;
    isNoCopy && this.openBillingDetails(order.id);
  }

  public moveToTrip(orderItemId, tripId): Observable<any> {
    return this._http.post(`${environment.apiOrderUri}${this._tripController}MoveToTrip`, { orderItemId, tripId });
  }

  public getProviderList(): Observable<IDictionaryItem[]> {
    return this._http.post(`${environment.apiOrderUri}${this._orderItemController}GetProviderList`, {})
      .pipe(pluck('items'));
  }

  public getPaymentMethodList(): Observable<IDictionaryItem[]> {
    return this._http.post(`${environment.apiOrderUri}${this._orderItemController}GetPaymentMethodList`, {})
      .pipe(pluck('items'));
  }

  public getBookerList(nameExpr: string): Observable<IDictionaryItem[]> {
    const queryFilter = new Query<any>({ filter: { nameExpr } }) ;
    return this._http.post(`${environment.apiOrderUri}${this._orderItemController}GetBookerList`, queryFilter);
  }

  public exportOrders(exportFilter: IBookingsExport): Observable<string> {
    const options: Object = { responseType: 'blob' };
    return this._http.post(`${environment.apiOrderUri}${this._orderItemController}ExportQuery`, exportFilter, options);
  }

  public getOrder(id: number): Observable<IBookingItem> {
    return this._http.get(`${environment.apiOrderUri}OrderItem/GetEntity?id=${id}`);
  }

  public getOrderModel(id: number): Observable<BookingItem> {
    return this.getOrder(id).pipe(map((x) => new BookingItem(x)));
  }

  public getOrderItemList(queryFilter: Query<IBookingsFilter>): Observable<IQueryResult<IBookingListItem>> {
    return this._http.post(`${environment.apiOrderUri}${this._orderItemController}PostQuery`, queryFilter);
  }

  public getTripList(queryFilter: Query<IBookingsFilter>): Observable<IQueryResult<IBookingListItem>> {
    return this._http.post(`${environment.apiOrderUri}${this._tripController}ShowTripListAsync`, queryFilter);
  }

  public updateTripName(renameQuery: TripRename): Observable<IBookingTrip> {
    return this._http.post(`${environment.apiOrderUri}${this._tripController}Rename`, renameQuery);
  }

  public getOrderStates(): Observable<IDictionaryItem[]> {
    return this._getTypes(`${this._orderItemController}`, 'GetOrderStateList');
  }

  public getPaymentStates(): Observable<IDictionaryItem[]> {
    return this._getTypes(`${this._orderItemController}`, 'GetPaymentStateList');
  }

  public getOrderTypes(): Observable<IDictionaryItem[]> {
    return this._getTypes(`${this._orderItemController}`, 'GetOrderItemTypeList');
  }

  public sendCancelOrderRequest(item: IBookingListItem): void {
    const connectionId = this._notification.context.connectionId;
    const queryId = this._utils.newGuid();
    const { id: orderItemId } = item;
    const body = { connectionId, queryId, orderItemId };

    const canceled$ = this._http.post(`${environment.apiOrderUri}OrderItem/Cancel`, body);
    canceled$.subscribe(() => this.canceled$.next());
  }

  public openBillingDetails(id: number): void {
    // this._router.navigate(['bookings/details/', id]);
    this._router.navigate(['bookings/order/', id]);
  }

  public setToolbarActions(openColumnsSelect, openFilter, bookingsFilter: BookingsFilterModel): void {
    this._toolbarActionsService.actions$.next(this._getToolbarActions(openColumnsSelect, openFilter, bookingsFilter));
  }

  public getPanelData(bookingsFilter, displayColumns): IH21DialogPanel<IBookingFilterPanelData> {
    return { data: { filter: bookingsFilter, displayColumns } };
  }

  public getQueryFilter(pageIndex: number, bookingsFilter: BookingsFilterModel, pageSize: number, order: IOrder): Query<IBookingsFilter> {
    const _filter = { ...bookingsFilter, bookerId: bookingsFilter.bookerId ? bookingsFilter.bookerId.id : null };
    return {
      withCount: true,
      filter: _filter,
      take: pageSize,
      skip: pageSize * (pageIndex || 0),
      order: order ? [order] : [],
    };
  }

  private _getToolbarActions(openColumnsSelect: Function, openFilter: Function, bookingsFilter: BookingsFilterModel) {
    return [
      // tslint:disable
      {
        name: 'filter',
        disabled: false,
        tooltipText: 'Open filter',
        icon: 'filter_list',
        cssClass: this._getCssStyles(bookingsFilter),
        action: () => openFilter(),
        visible: true,
      },
      {
        name: 'setDisplayedColumns',
        disabled: false,
        tooltipText: 'Select displayed columns',
        icon: 'view_week',
        action: () => openColumnsSelect(),
        visible: true,
      },
      // tslint:enable
    ];
  }

  private _getTypes(controller: string, action: string): Observable<IDictionaryItem[]> {
    return this._http.get(`${ environment.apiOrderUri }${ controller }${ action }`)
      .pipe(
        filter((x: IQueryResult<IDictionaryItem>) => x.count > 0),
        map((statesQuery: IQueryResult<IDictionaryItem>) => statesQuery.items),
      );
  }

  private _checkFilter(filterModel: BookingsFilterModel): boolean {
    return !!Object.keys(filterModel)
      .filter((fieldName) => fieldName !== 'application')
      .find((value) => {
        if (value === 'paymentStateIdIn') { return; }
        if (Array.isArray(filterModel[value])) {
          return filterModel[value] && filterModel[value].length;
        }
        return !!filterModel[value];
      });
  }

  private _getCssStyles(filterModel: BookingsFilterModel): string {
    return this._checkFilter(filterModel) ? 'h21-header-toolbar_action-button__is-marked' : '';
  }

}
