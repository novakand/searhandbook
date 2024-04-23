import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';

// external libs
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

// internal libs
import { H21DialogPanelService, IH21DialogPanel, IOrder, LoadProgressService, OrderState } from 'h21-be-ui-kit';

// services
import { BookingsService } from '../../../services';
import { BookingsListService } from '../bookings-list.service';
import { NotificationSignalRService, StorageService } from '@core/services';
import { PaymentNavigateService } from '@shared/services';

// interfaces
import { IBookingListItem, IBookingListTrip, IDictionaryItem } from '../../../interfaces';

// components
import { BookingsTripEditDialogComponent } from '../../bookings-trip-edit-dialog';
import { SendRequestDialogComponent } from '@shared/components';

// enums
import { BookingDocumentType, BookingType, CancellationStateType } from '../../../enums';
import { SendRequestDialogType } from '@app/enums';

// data
import { PageEvent } from '@angular/material/paginator';
import { BookingsFilterModel, TripRename } from '../../../models';

@Component({
  selector: 'h21-bookings-list-trips',
  templateUrl: './bookings-list-trips.component.html',
  providers: [PaymentNavigateService],
})
export class BookingsListTripsComponent implements OnDestroy, OnInit  {

  @Input() public displayedColumns: string[];
  @Input() public orderStates: IDictionaryItem[];

  public dataSource: MatTableDataSource<IBookingListTrip>;
  public pageSize = 10;
  public pageIndex = 0;
  public totalCount: number;
  public inProgress = true;
  public noProgress = false;
  public bookingTypes = BookingType;
  public expandedTrips: number[] = [];
  public cancellationStateTypes = CancellationStateType;
  public order: IOrder = { field: 'updateDate', desc: true };
  public documentType = BookingDocumentType;
  public orderState = OrderState;

  private _tripList: IBookingListTrip[];
  private _filter = new BookingsFilterModel();
  private _getTrips$ = new Subject<number>();
  private _destroy$ = new Subject<boolean>();

  @ViewChild(MatPaginator) private _paginator: MatPaginator;

  constructor(
    private _dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _bookingsService: BookingsService,
    private _loadProgressService: LoadProgressService,
    private _dialogPanelService: H21DialogPanelService,
    private _bookingsListService: BookingsListService,
    private _notifyService: NotificationSignalRService,
    private _payVisionNavigate: PaymentNavigateService,
  ) { }

  public ngOnInit(): void {
    this._initFilterListener();
    this._initGetTripsListener();

    this.pageIndex = this.pageIndex = this._bookingsListService.getPageIndex();
    this.pageSize = this._bookingsListService.getPageSize();
    this._submitRequest(this.pageIndex);
    this._onInitListening();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index, item) {
    return item.id;
  }

  public onRedirectToPayVision(event: Event, order: IBookingListItem): void {
    event.stopPropagation();
    this._payVisionNavigate.redirectToPayVision(order.typeCode);
  }

  public onDownloadDocument(type: BookingDocumentType, order: IBookingListItem): void {
    this._bookingsListService.downloadDocument(type, order, true);
  }

  public onCancel(order: IBookingListItem): void {
    this._bookingsListService.cancel(order);
  }

  public onOpenBookingDetails(order: IBookingListItem): void {
    this._bookingsService.onOpenBookingDetails(order);
  }

  // public isAllSelected(): boolean {
  //   return this.dataSource.data.length === this.selectedOrders.length;
  // }

  // public isOrderSelected(id: number): boolean {
  //   return this.selectedOrders.findIndex((e) => e === id) >= 0;
  // }

  // public selectAll(checked: boolean): void {
  //   this.selectedOrders = [];
  //   checked && this.dataSource.data.forEach((t) => t.bookings.forEach((e) => this.selectedOrders.push(e.id)));
  // }

  // public selectOrder(id: number, checked: boolean): void {
  //   if (checked) {
  //     this.selectedOrders.push(id);
  //   } else {
  //     const index = this.selectedOrders.findIndex((e) => e === id);
  //     this.selectedOrders.splice(index, 1);
  //   }
  // }

  public isTripExpanded(id: number): boolean {
    return this._getExpandedTripsIndex(id) >= 0;
  }

  public toggleTripExpanded(id: number): void {
    const index = this._getExpandedTripsIndex(id);
    index >= 0 ? this.expandedTrips.splice(index, 1) : this.expandedTrips.push(id);
  }

  public openEditDialog(trip: IBookingListTrip): void {
    const dialogRef = this._dialog.open(BookingsTripEditDialogComponent, {
      data: trip,
      disableClose: true,
      minWidth: '400px',
      maxWidth: '600px',
      backdropClass: 'h21-message-dialog_backdrop',
      panelClass: 'h21-message-dialog_panel',
    });

    dialogRef.afterClosed()
      .pipe(filter(Boolean))
      .subscribe((result) => {
        this._startLoading();
        const renameQuery = new TripRename(trip.id, result);
        this._bookingsService.updateTripName(renameQuery).subscribe((updatedTrip) => {
          this._bookingsListService.updateTrip(this._tripList, updatedTrip);
          this._setDataSource(this._tripList);
          this._stopLoading();
        });
    });
  }

  public openTrip(id: number): void {
    window.open(`./bookings/trip/${id}`, '_blank');
  }

  public pageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this._submitRequest(event.pageIndex);
  }

  public openShareTripDialogue(trip: IBookingListTrip): void {
    const panelData: IH21DialogPanel = {
      data: {
        type: SendRequestDialogType.ShareTrip,
        link: this._getLink(trip),
        trip,
      },
    };
    panelData.data.overlay = this._dialogPanelService.open(SendRequestDialogComponent, panelData);
  }

  private _setDataSource(items: IBookingListTrip[]): void {
    items.forEach((item) => this._bookingsListService.fillBookingListItems(item.orderItems));
    if (this.dataSource) {
      this.dataSource.connect().next(items);
    } else {
      this.dataSource = new MatTableDataSource<IBookingListTrip>(items);
      this.dataSource.paginator = this._paginator;
    }
  }

  private _getExpandedTripsIndex(id: number): number {
    return this.expandedTrips.findIndex((e) => e === id);
  }

  private _initGetTripsListener(): void {
    const getTrips$ = this._getTrips$.pipe(
      switchMap((pageIndex) => {
        const pageState = { ...this._storage.bookingsPageState$.getValue(), pageIndex, pageSize: this.pageSize };
        this._storage.bookingsPageState$.next(pageState);

        const bookingsFilter = this._bookingsService.getQueryFilter(pageIndex, this._filter, this.pageSize, this.order);
        return this._bookingsService.getTripList(bookingsFilter);
      }),
      takeUntil(this._destroy$),
    );

    getTrips$.subscribe(({ items, count }) => {
      this.totalCount = count;
      this._tripList = items;
      this.noProgress = count === 0;
      this._setDataSource(this._tripList);
      this._stopLoading();
    });
  }

  private _submitRequest(index: number = 0): void {
    this._startLoading();
    this._getTrips$.next(index);
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

  private _getLink(trip: IBookingListTrip): string {
    return `${window.location.href}/trip/${trip.id}`;
  }

  private _startLoading(): void {
    this._loadProgressService.show(2);
    this._cdr.markForCheck();
  }

  private _stopLoading(): void {
    this.inProgress = false;
    this._loadProgressService.hide(2);
    this._cdr.markForCheck();
  }

  private _onInitListening(): void {
    this._notifyService.orderCancel$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this._submitRequest(this.pageIndex));
  }

}
