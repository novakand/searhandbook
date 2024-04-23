import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener, OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren, ViewRef,
} from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDivider } from '@angular/material';

// external libraries
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';

// h21-be-ui-kit
import {
  H21DialogPanelService,
  IH21DialogPanel,
  LoadProgressService,
  OrderState,
  PermissionService,
  ToolbarActionsService,
} from 'h21-be-ui-kit';

// enums
import { BookingType } from '../../enums';

// animation
import { ToggleMatExpansionAnimation } from '@app/animations';

// services
import { BookingsListService } from '@components/bookings/components/bookings-list/bookings-list.service';
import { BookingReportService, BookingsService } from '../../services';
import { NotificationSignalRService, ReportService } from '@core/services';

// models
import { Anchor, BookingItem } from '../../models';

// components
import { BookingsSendEmailComponent } from '@components/bookings/components/bookings-send-email';
import { SelectTripDialogComponent } from '@components/search/components/select-trip-dialog';

@Component({
  selector: 'h21-bookings-order',
  templateUrl: './bookings-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ToggleMatExpansionAnimation],
  providers: [ReportService],
})
export class BookingsOrderComponent implements AfterViewChecked, AfterViewInit, OnInit, OnDestroy {

  public order$: BehaviorSubject<BookingItem> = new BehaviorSubject<BookingItem>(null);

  public orderId: number;
  public loadInProgress: boolean;
  public activeAnchorName: string;

  public bookingTypes = BookingType;
  public orderState = OrderState;

  public pending: boolean;

  @ViewChild('sidenav') private _sidenav: ElementRef;
  @ViewChild('sidenavContainer') private _sidenavContainer: ElementRef;
  @ViewChildren(MatDivider, { read: ElementRef }) private _dividers: QueryList<ElementRef>;

  private _anchors$: BehaviorSubject<Anchor[]> = new BehaviorSubject<Anchor[]>([]);
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _renderer: Renderer2,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _service: BookingsService,
    private _scroller: ViewportScroller,
    private _reportService: ReportService,
    private _permissions: PermissionService,
    private _bookingsListService: BookingsListService,
    private _loadProgressService: LoadProgressService,
    private _dialogPanelService: H21DialogPanelService,
    private _bookingReportService: BookingReportService,
    private _toolbarActionsService: ToolbarActionsService,
    private _notifyService: NotificationSignalRService,
  ) {}

  @HostListener('window:scroll') public onScroll(): void {
    const offset = this._sidenavContainer.nativeElement.scrollTop;
    this._anchors$.value.forEach((e) => offset >= (Number(e.offset) - 50) && (this.activeAnchorName = e.name));
  }

  public ngOnInit(): void {
    this._loadProgressService.show(1);
    this.orderId = +this._route.snapshot.paramMap.get('id');
    this._load();
    this._onInitListening();

    this._service.canceled$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.pending = false;
        this._setToolbarActions(this.order$.getValue());
      });
  }

  public ngAfterViewInit() {
    this._dividers.changes
      .pipe(
        filter((dividers) => dividers && dividers.length),
        map((dividers) => dividers.map((v) => new Anchor(v.nativeElement.id, v.nativeElement.offsetTop))),
        tap((data) => this.activeAnchorName = data[0].name),
      ).subscribe((dividers) => this._anchors$.next(dividers));
  }

  public ngAfterViewChecked(): void {
    if (this._sidenavContainer) {
      const container = this._sidenavContainer ? this._sidenavContainer.nativeElement : null;
      const sidenav = this._sidenav ? this._sidenav.nativeElement : null;

      if (container && sidenav) {
        const hDif = container.scrollHeight - container.clientHeight;
        if (hDif > 0) {
          const wDif = container.offsetWidth - container.scrollWidth;
          this._renderer.setStyle(container, 'overflow-y', 'scroll');
          this._renderer.setStyle(sidenav, 'right', `${wDif}px`);
        } else {
          this._renderer.setStyle(container, 'overflow-y', 'auto');
          this._renderer.setStyle(sidenav, 'right', '0');
        }
      }
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number { return index; }

  public openSelectTripDialog(): void {
    const panelData: IH21DialogPanel = { data: {  } };

    panelData.data.overlay = this._dialogPanelService.open(SelectTripDialogComponent, panelData);
    panelData.data.overlay.detachments()
      .pipe(
        switchMap(() => {
          const selectedTrip = panelData.data.selectedTrip;
          if (selectedTrip) {
            this._toggleAnimation('show', true, true);
            return this._service.moveToTrip(this.orderId, selectedTrip.id);
          }
          return EMPTY;
        }),
        takeUntil(this._destroy$),
      )
      .subscribe(() => this._load());
  }

  // public setDocumentType(type: BookingDocumentType): void {
    // this.documentType = type;
    // this._setToolbarActions();
    // this._cdr.detectChanges();
  // }

  private _load(): void {
    const getOrderModel$ = this._service.getOrderModel(this.orderId)
      .pipe(
        tap(() => this._toggleAnimation('show', true, false)),
        tap((data: BookingItem) => {
          data.bookingType = this._bookingsListService.getBookingType(data);
          data.canCancel = this._bookingsListService.getCanCancelField(data);
          this._setToolbarActions(data);
          this.order$.next(data);
          this._loadProgressService.hide(1);
        }),
        takeUntil(this._destroy$),
      );

    getOrderModel$.subscribe(
      () => this._toggleAnimation('hide', false, true),
      () => this._toggleAnimation('hide', false, true),
      );
  }

  private _toggleAnimation(method: string, isProgress: boolean, detect: boolean): void {
    this._loadProgressService[method](1);
    this.loadInProgress = isProgress;
    (detect && !(<ViewRef>this._cdr).destroyed) && this._cdr.detectChanges();
  }

  private _cancelOrder(): void {
    this.pending = true;
    this._setToolbarActions(this.order$.getValue());
    const order = this.order$.getValue();
    this._bookingsListService.cancel(order);
  }

  private _saveReport(): void {
    // this._bookingReportService.getOrderItemReport(this.orderId, this.documentType)
    //   .pipe(takeUntil(this._destroy$))
    //   .subscribe((data) => {
    //     const file = new File([data], `Voucher_${this.orderId}.pdf`, { type: 'application/pdf' });
    //     saveAs(file);
    //   });
  }

  private _printOrder(): void { window.print(); }

  private _sendEmail(): void {
    // this._updateToolbarActions(true, 'sendingEmail');
    //
    // this._bookingReportService.sendEmail(this.orderId, this.documentType)
    //   .pipe(takeUntil(this._destroy$))
    //   .subscribe(
    //     () => this._updateToolbarActions(false, 'sendingEmail'),
    //     () => this._updateToolbarActions(false, 'sendingEmail'),
    //   );
  }

  private _updateToolbarActions(state: boolean, field: string): void {
    this[field] = state;
    this._setToolbarActions(this.order$.getValue());
  }

  private _modify(): void {
    const panelData: IH21DialogPanel = {
      data: { order: this.order$.getValue() },
    };

    panelData.data.overlay = this._dialogPanelService.open(BookingsSendEmailComponent, panelData);
    panelData.data.overlay.detachments()
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => { });
  }

  private _setToolbarActions(item: BookingItem): void {
    this._toolbarActionsService.actions$.next([
      {
        name: 'modify',
        disabled: false,
        tooltipText: 'Modify document',
        isSimpleButton: true,
        simpleButtonText: 'Modify',
        icon: 'note_add',
        action: () => this._modify(),
        visible: !!item.corporateId && item.bookingType === BookingType.Hotel,
        cssClass: 'mat-primary mr-1',
      },
      {
        name: 'cancel',
        disabled: this.pending,
        tooltipText: 'Cancel document',
        isSimpleButton: true,
        simpleButtonText: 'Cancel',
        icon: 'cancel',
        action: () => this._cancelOrder(),
        visible: item.orderStateId !== this.orderState.Cancelled,
        cssClass: 'mat-warn',
      },
      {
        name: 'print',
        disabled: false,
        tooltipText: 'Print document',
        icon: 'print',
        action: () => this._printOrder(),
        visible: true,
      },
    ]);
  }

  private _onInitListening(): void {
    this._notifyService.orderCancel$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this._load());
  }

}
