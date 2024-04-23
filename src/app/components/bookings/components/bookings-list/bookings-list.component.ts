import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { MatDialog } from '@angular/material';

// external libs
import { filter, takeUntil, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';

// internal libs
import {
  H21ColumnsSelectRef,
  H21ColumnsSelectService,
  H21DialogPanelService,
  IH21Column,
  IH21DialogPanel,
  LoadProgressService,
  PanelAction,
} from 'h21-be-ui-kit';

// animations
import { ToggleVisibilityAnimation } from '@app/animations';

// components
import { BookingsFilterComponent } from '../bookings-filter';

// services
import { BookingReportService, BookingsService } from '../../services';
import { StorageService } from '@core/services';

// models
import { BookingsFilterModel } from '../../models';

// animation
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

// interfaces
import { IBookingFilterPanelData, IBookingsExport, IDictionaryItem } from '../../interfaces';

// data
import { columnsConst } from '../../constants';

// enums
import { MimeType } from '../../enums';


@Component({
  selector: 'h21-bookings-list',
  templateUrl: './bookings-list.component.html',
  animations: [ToggleVisibilityAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsListComponent implements OnInit, OnDestroy {

  public mimeType = MimeType;
  public showTripsMode = false;
  public selectedStates: number[] = [];
  public displayedColumns: string[];
  public paymentStates: IDictionaryItem[] = [];

  // private _selectedOrdersIds: number[] = [];
  private _columns: IH21Column[];
  private _filter: BookingsFilterModel;
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _bookingsService: BookingsService,
    private _storage: StorageService,
    private _dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private _loadProgressService: LoadProgressService,
    private _dialogPanelService: H21DialogPanelService,
    private _bookingReportService: BookingReportService,
    private _columnsSelectDialog: H21ColumnsSelectService,
  ) {
    this._setColumns();
  }

  public ngOnInit() {
    this._filter = this._storage.bookingsFilter$.getValue() || new BookingsFilterModel();
    this._setShowTripsMode();
    this._setSelectedStatesFromFilter();
    this._setDisplayedColumns();
    this._setToolbarActions();
    this._setPaymentStates();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public onExport(mimeType: MimeType): void {
    const body: IBookingsExport = {
      groupByTrip: this.showTripsMode,
      mimeType,
      query: {
        filter: this._filter,
        order: [{ field: 'createDate', desc: true }],
      },
      displayFields: this._getDisplayFields(),
    };
    this._bookingsService.exportOrders(body).subscribe((data) => {
      const name = `${this.showTripsMode ? 'trips' : 'orders'}${mimeType === MimeType.CSV ? '.csv' : ''}`;
      const file = new File([data], name, { type: mimeType });
      saveAs(file);
    });
  }

  public isAllStatesSelected(): boolean {
    return this.paymentStates && (this.paymentStates.length === this.selectedStates.length || !this.selectedStates.length);
  }

  public toggleAllStatesSelected(): void {
    this.selectedStates = this.isAllStatesSelected() ? [] : this.paymentStates.map((order) => order.id);
    this._setOrderStateToFilter();
  }

  public isSelectedState(id: number): boolean {
    return this._getSelectedStateIndex(id) > -1;
  }

  public toggleSelectedState(id: number): void {
    const index = this._getSelectedStateIndex(id);
    index > -1 ? this.selectedStates.splice(index, 1) : this.selectedStates.push(id);
    this._setOrderStateToFilter();
  }

  public openFilter(): void {
    const panelData = this._bookingsService.getPanelData(this._filter, this.displayedColumns);
    panelData.data.overlay = this._dialogPanelService.open(BookingsFilterComponent, panelData);
    this._initDetachmentsListener(panelData);
  }

  public checkFilter(bookingsFilter: BookingsFilterModel): void {
    const fields = ['typeIdIn', 'paymentFormIdIn', 'providerCodeIn', 'paymentStateIdIn'];
    fields.forEach((field) => {
      this._filter[field] = (!bookingsFilter[field] || !bookingsFilter[field].length)
        ? null
        : bookingsFilter[field];
    });
  }

  public openColumnsSelect(): void {
    const columnsSelectDialogRef = this._columnsSelectDialog.open(this._columns);
    this._initAfterClosedListener(columnsSelectDialogRef);
  }

  public onShowTrips(event: MatSlideToggleChange): void {
    this.showTripsMode = event.checked;
    this._storage.bookingsPageState$.next({ showTripsMode: this.showTripsMode, pageIndex: 0, pageSize: 10 });
  }

  private _setDisplayedColumns(): void {
    this.displayedColumns = this._columns.filter((v) => v.displayed).map((z) => z.name);
  }

  private _setToolbarActions(): void {
    this._bookingsService.setToolbarActions(
      this.openColumnsSelect.bind(this),
      this.openFilter.bind(this),
      this._filter,
    );
  }

  private _initAfterClosedListener(columnsSelectDialogRef: H21ColumnsSelectRef): void {
    const afterClosed$ = columnsSelectDialogRef.afterClosed$
      .pipe(
        filter((data) => !!data),
        tap((columns) => localStorage.setItem('BookingsColumns', JSON.stringify(columns))),
        takeUntil(this._destroy$),
      );

    afterClosed$.subscribe((data) => {
      this._columns = data;
      this._setDisplayedColumns();
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _initDetachmentsListener(panelData: IH21DialogPanel<IBookingFilterPanelData>): void {
    const detachments$ = panelData.data.overlay.detachments()
      .pipe(
        filter(() => panelData.data.action === PanelAction.SAVE),
        takeUntil(this._destroy$),
      );

    detachments$.subscribe(() => {
      this._filter = new BookingsFilterModel(panelData.data.filter);
      this.checkFilter(panelData.data.filter);
      this.selectedStates = panelData.data.filter.paymentStateIdIn || [];
      this._setToolbarActions();
      this._storage.bookingsFilter$.next(this._filter);
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _setPaymentStates(): void {
    this._loadProgressService.show(1);
    this._bookingsService.getPaymentStates().pipe(takeUntil(this._destroy$))
      .subscribe((data: IDictionaryItem[]) => {
        this.paymentStates = data;
        this._loadProgressService.hide(1);
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _getSelectedStateIndex(id: number): number {
    return this.selectedStates.findIndex((e) => e === id);
  }

  private _setOrderStateToFilter(): void {
    this._filter.paymentStateIdIn = this._isPaymentStateSelected() ? this.selectedStates : null;
    this._storage.bookingsFilter$.next(this._filter);
  }

  private _isPaymentStateSelected(): boolean {
    const { length: selectedStatesLength } = this.selectedStates;
    return selectedStatesLength && selectedStatesLength !== this.paymentStates.length;
  }

  private _getDisplayFields(): Record<string, string> {
    const excludedList = ['cancellationMark', 'actions', 'selected'];
    const displayFields: Record<string, string> = {};
    this.displayedColumns.forEach((displayedColumn) => {
      if (excludedList.includes(displayedColumn)) { return; }
      displayFields[displayedColumn] = this._columns.find((column) => column.name === displayedColumn).caption;
    });

    return displayFields;
  }

  private _setSelectedStatesFromFilter(): void {
    this._filter.paymentStateIdIn && (this.selectedStates = [...this._filter.paymentStateIdIn]);
  }

  private _setShowTripsMode(): void {
    const pageState = this._storage.bookingsPageState$.getValue();
    this.showTripsMode = pageState.showTripsMode;
  }

  private _setColumns(): void {
    const stored = localStorage.getItem('BookingsColumns');
    this._columns = (stored && JSON.parse(stored)) ? JSON.parse(stored) : columnsConst;
  }

}
