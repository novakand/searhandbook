import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
  ViewRef,
} from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDivider } from '@angular/material';

// external libraries
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { saveAs } from 'file-saver';

// h21-be-ui-kit
import {
  LoadProgressService,
  ToolbarActionsService,
} from 'h21-be-ui-kit';

// enums
import { BookingDocumentType } from '../../enums/booking-document-type';

// animation
import { ToggleMatExpansionAnimation } from '@app/animations';

// services
import { BookingReportService, BookingsService } from '../../services';
import { ReportService } from '@core/services';

// models
import { Anchor, BookingItem } from '../../models';

enum AnimationState {
  DONE = 'done',
  LEAVE = 'leave',
  START = 'start',
  ENTER = 'enter',
  VOID = 'void',
  UP = 'up',
  DOWN = 'down',
  COLLAPSED = 'collapsed',
  EXPANDED = 'expanded',
}

@Component({
  selector: 'h21-bookings-details',
  templateUrl: './bookings-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ToggleMatExpansionAnimation],
  providers: [ReportService],
})
export class BookingsDetailsComponent implements AfterViewChecked, AfterViewInit, OnInit {

  public order$: BehaviorSubject<BookingItem> = new BehaviorSubject<BookingItem>(null);
  public orderId: number;
  public loadInProgress: boolean;
  public animationStateType = AnimationState;
  public animationState = AnimationState.EXPANDED;
  public activeAnchorName: string;
  public documentType: BookingDocumentType;

  @ViewChild('sidenav') private _sidenav: ElementRef;
  @ViewChild('sidenavContainer') private _sidenavContainer: ElementRef;
  @ViewChild('cardHeader') private _cardHeader: ElementRef;
  @ViewChildren(MatDivider, { read: ElementRef }) private _dividers: QueryList<ElementRef>;

  private sendingEmail: boolean;
  private sendingPrint: boolean;

  private _anchors$: BehaviorSubject<Anchor[]> = new BehaviorSubject<Anchor[]>([]);
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _renderer: Renderer2,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _service: BookingsService,
    private _bookingReportService: BookingReportService,
    private _scroller: ViewportScroller,
    private _loadProgressService: LoadProgressService,
    private _toolbarActionsService: ToolbarActionsService,
    private _reportService: ReportService,
  ) {}

  @HostListener('window:scroll') public onScroll(): void {
    const height = this._cardHeader.nativeElement.offsetHeight;
    const offset = this._sidenavContainer.nativeElement.scrollTop;
    this._anchors$.value.forEach((e) => offset >= ((Number(e.offset) + Number(height)) - 50) && (this.activeAnchorName = e.name));
  }

  public ngOnInit(): void {
    this.orderId = +this._route.snapshot.paramMap.get('id');
    this._load();
    this._setToolbarActions();
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

  public toggleCardHeaderVisibility(): void {
    this.animationState = (this.animationState === AnimationState.EXPANDED) ? AnimationState.COLLAPSED : AnimationState.EXPANDED;
  }

  // public setDocumentType(type: BookingDocumentType): void {
    // this.documentType = type;
    // this._setToolbarActions();
    // this._cdr.detectChanges();
  // }

  public downloadDocument(type: BookingDocumentType): void {
    switch (type) {
      case BookingDocumentType.Voucher:
        // this._reportService.downloadVoucher(this.orderId);
        break;
      case BookingDocumentType.BillingDetails:
        // this._reportService.downloadBillingDetails(this.orderId);
        break;
      default:
        break;
    }
  }

  private _load(): void {
    const getOrderModel$ = this._service.getOrderModel(this.orderId)
      .pipe(
        tap(() => this._toggleAnimation('show', true, false)),
        tap((data) => this.order$.next(data)),
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

  private _saveReport(): void {
    this._bookingReportService.getOrderItemReport(this.orderId, this.documentType)
      .pipe(takeUntil(this._destroy$))
      .subscribe((data) => {
        const file = new File([data], `Voucher_${this.orderId}.pdf`, { type: 'application/pdf' });
        saveAs(file);
      });
  }

  private _printReport(): void {
    this._updateToolbarActions(true, 'sendingPrint');

    this._bookingReportService.printData(this.orderId, this.documentType)
      .pipe(takeUntil(this._destroy$))
      .subscribe((data) => {
        this._updateToolbarActions(false, 'sendingPrint');
        (<any>window).printJS({
          printable: data,
          type: 'pdf',
          base64: true,
        });
      },
        () => this._updateToolbarActions(false, 'sendingPrint'));
  }

  private _sendEmail(): void {
    this._updateToolbarActions(true, 'sendingEmail');

    this._bookingReportService.sendEmail(this.orderId, this.documentType)
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        () => this._updateToolbarActions(false, 'sendingEmail'),
        () => this._updateToolbarActions(false, 'sendingEmail'),
      );
  }

  private _updateToolbarActions(state: boolean, field: string): void {
    this[field] = state;
    this._setToolbarActions();
  }

  private _setToolbarActions(): void {
    this._toolbarActionsService.actions$.next([
      {
        name: 'document',
        disabled: false,
        tooltipText: 'Document type',
        isSimpleButton: !!this.documentType,
        simpleButtonText: this.documentType,
        icon: !this.documentType ? 'insert_drive_file' : null,
        visible: true,
        children: [
          {
            name: 'voucherDoc',
            disabled: this.documentType === BookingDocumentType.Voucher,
            isSimpleButton: true,
            simpleButtonText: 'Voucher',
            icon: null,
            // action: () => this.setDocumentType(BookingDocumentType.Voucher),
            action: () => this.downloadDocument(BookingDocumentType.Voucher),
            visible: true,
          },
          {
            name: 'billingDetailsDoc',
            disabled: this.documentType === BookingDocumentType.BillingDetails,
            isSimpleButton: true,
            simpleButtonText: 'Billing details',
            icon: null,
            // action: () => this.setDocumentType(BookingDocumentType.BillingDetails),
            action: () => this.downloadDocument(BookingDocumentType.BillingDetails),
            visible: true,
          },
          // {
          //   name: 'confirmationDoc',
          //   disabled: true,
          //   isSimpleButton: true,
          //   simpleButtonText: 'Confirmation',
          //   icon: null,
          //   action: () => this.setDocumentType(BookingDocumentType.Confirmation),
          //   visible: true,
          // },
          // {
          //   name: 'invoiceDoc',
          //   disabled: true,
          //   isSimpleButton: true,
          //   simpleButtonText: 'Invoice',
          //   icon: null,
          //   action: () => this.setDocumentType(BookingDocumentType.Invoice),
          //   visible: true,
          // },
        ],
      },
      // {
      //   name: 'viewDocument',
      //   disabled: !this.documentType,
      //   tooltipText: 'View document',
      //   icon: 'visibility',
      //   action: () => this._saveReport(),
      //   visible: false,
      // },
      /*{
        name: 'sendDocument',
        disabled: !this.documentType || this.sendingEmail,
        tooltipText: 'Send document',
        icon: 'email',
        action: () => this._sendEmail(),
        visible: false,
      },*/
      // {
      //   name: 'printDocument',
      //   disabled: !this.documentType || this.sendingPrint,
      //   tooltipText: 'Print document',
      //   icon: 'print',
      //   action: () => this._printReport(),
      //   visible: false,
      // },
      // {
      //   name: 'help',
      //   disabled: false,
      //   tooltipText: 'Help',
      //   icon: 'help',
      //   action: () => { },
      //   visible: false,
      // },
    ]);
  }

}
