import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewRef } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';

// external libs
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// internal libs
import {
  H21DefaultDialogService,
  H21DialogPanelService,
  IH21DialogPanel,
  IOrder,
  LoadProgressService,
  OrderState
} from 'h21-be-ui-kit';

// services
import { NotificationSignalRService, ReportService, StorageService } from '@core/services';
import { BookingsListService } from '../bookings-list.service';
import { BookingsService } from '../../../services';
import { PaymentNavigateService } from '@shared/services';

// enums
import { BookingDocumentType, BookingType, CancellationStateType } from '../../../enums';

// interfaces
import { IBookingListItem, IDictionaryItem } from '../../../interfaces';

// models
import { BookingsFilterModel } from '../../../models';

// components
import { BookingsSendEmailComponent } from '@components/bookings/components/bookings-send-email';

@Component({
  selector: 'h21-bookings-list-orders',
  templateUrl: './bookings-list-orders.component.html',
  providers: [ReportService, PaymentNavigateService],
})
export class BookingsListOrdersComponent implements OnDestroy, OnInit {

  // @Output() public selectedOrdersIds = new EventEmitter<number[]>();
  @Input() public displayedColumns: string[];
  @Input() public orderStates: IDictionaryItem[];

  public bookingDocumentType = BookingDocumentType;
  public totalCount: number;
  public orderList: IBookingListItem[];
  public selectedOrders: number[] = [];
  public dataSource: MatTableDataSource<IBookingListItem>;
  public pageSize = 10;
  public pageIndex = 0;
  public inProgress = true;
  public noProgress = false;
  public bookingTypes = BookingType;
  public cancellationStateTypes = CancellationStateType;
  public order: IOrder = { field: 'updateDate', desc: true };

  public orderState = OrderState;

  private _filter = new BookingsFilterModel();
  private _getOrders$ = new Subject<number>();
  private _destroy$ = new Subject<boolean>();

  @ViewChild(MatPaginator) private _paginator: MatPaginator;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _bookingsService: BookingsService,
    private _dialogs: H21DefaultDialogService,
    private _loadProgressService: LoadProgressService,
    private _bookingsListService: BookingsListService,
    private _dialogPanelService: H21DialogPanelService,
    private _notifyService: NotificationSignalRService,
    private _payVisionNavigate: PaymentNavigateService,
  ) { }

  public ngOnInit(): void {
    this._initFilterListener();
    this._initGetOrdersListener();

    this.pageIndex = this._bookingsListService.getPageIndex();
    this.pageSize = this._bookingsListService.getPageSize();
    this._submitRequest(this.pageIndex);

    this._onInitListening();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index, item): string {
    return item.id;
  }

  public isCancelAvailable(order: IBookingListItem): boolean {
    return ![this.orderState.Cancelled, this.orderState.Cancelling].includes(order.orderStateId);
  }

  public onRedirectToPayVision(event: Event, order: IBookingListItem): void {
    event.stopPropagation();
    this._payVisionNavigate.redirectToPayVision(order.typeCode);
  }

  public onOpenBookingDetails(order: IBookingListItem): void {
    this._bookingsService.onOpenBookingDetails(order);
  }

  public onDownloadDocument(type: BookingDocumentType, order: IBookingListItem): void {
    this._bookingsListService.downloadDocument(type, order, true);
  }

  public onCancel(order: IBookingListItem): void {
    this._bookingsListService.cancel(order);
  }

  public onModify(order: IBookingListItem): void {
    const panelData: IH21DialogPanel = {
      data: { order: order },
    };

    panelData.data.overlay = this._dialogPanelService.open(BookingsSendEmailComponent, panelData);
    panelData.data.overlay.detachments()
    .pipe(takeUntil(this._destroy$))
    .subscribe(() => { });
  }

  public pageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this._submitRequest(event.pageIndex);
  }

  // public isAllSelected(): boolean {
  //   return this.dataSource.data.length === this.selectedOrders.length;
  // }

  // public isOrderSelected(id: number): boolean {
  //   return this.selectedOrders.findIndex((e) => e === id) >= 0;
  // }

  // public selectAll(checked: boolean): void {
  //   this.selectedOrders = [];
  //   checked && this.dataSource.data.forEach((e) => this.selectedOrders.push(e.id));
  //   this.selectedOrdersIds.emit(this.selectedOrders);
  // }

  // public selectOrder(id: number, checked: boolean): void {
  //   if (checked) {
  //     this.selectedOrders.push(id);
  //   } else {
  //     const index = this.selectedOrders.findIndex((e) => e === id);
  //     this.selectedOrders.splice(index, 1);
  //   }
  //   this.selectedOrdersIds.emit(this.selectedOrders);
  // }

  public changeOrderState(bookingId: number, stateId: number): void {
    // any action
  }

  private _setDataSource(items: IBookingListItem[]): void {
    this._bookingsListService.fillBookingListItems(items);
    if (this.dataSource) {
      this.dataSource.connect().next(items);
    } else {
      this.dataSource = new MatTableDataSource<IBookingListItem>(items);
      this.dataSource.paginator = this._paginator;
    }
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _initGetOrdersListener(): void {
    const getOrders$ = this._getOrders$.pipe(
      switchMap((pageIndex) => {
        const pageState = { ...this._storage.bookingsPageState$.getValue(), pageIndex, pageSize: this.pageSize };
        this._storage.bookingsPageState$.next(pageState);

        const bookingsFilter = this._bookingsService.getQueryFilter(pageIndex, this._filter, this.pageSize, this.order);
        return this._bookingsService.getOrderItemList(bookingsFilter);
      }),
      takeUntil(this._destroy$),
    );

    getOrders$.subscribe(({ items, count }) => {
      this.totalCount = count;
      this.orderList = items;
      this._setDataSource(this.orderList);

      this.inProgress = false;
      this.noProgress = count === 0;
      this._loadProgressService.hide(2);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _submitRequest(index: number = 0): void {
    this._loadProgressService.show(2);
    this._cdr.markForCheck();
    this._getOrders$.next(index);
  }

  private _initFilterListener(): void {
    this._storage.bookingsFilter$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((bookingsFilter) => {
        this._filter = bookingsFilter;
        this._submitRequest();
      });
  }

  private _onInitListening(): void {
    this._notifyService.orderCancel$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this._submitRequest(this.pageIndex));
  }

}
