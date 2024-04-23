import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewRef,
} from '@angular/core';

// external libs
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { DIALOG_PANEL_DATA, IH21DialogPanel, Query, Utils } from 'h21-be-ui-kit';

// models
import { PaymentFilter } from '@components/search/models';

// services
import { TravelerService } from '@components/search/services';

// environment
import { ToggleVisibilityAnimation } from '@animation/toggle-visibility';
import { ToggleSlideAnimation } from '@animation/toggle-slide';

// interfaces
import { IPayment, ITraveler } from '@components/search';

// enums
import { AnimationState } from '@app/enums/animation-state';

@Component({
  selector: 'h21-select-booker-dialog',
  templateUrl: './select-booker-dialog.component.html',
  animations: [
    ToggleSlideAnimation,
    ToggleVisibilityAnimation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [TravelerService],
})
export class SelectBookerDialogComponent implements OnDestroy, OnInit, AfterViewInit {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public dataSource: ITraveler[] = [];
  public displayedColumns = ['travelerName', 'isBooker', 'payment', 'card'];

  public booker: ITraveler;
  public cardMap = new Map<number, IPayment[]>();

  public actionInProgress: boolean;
  public loadInProgress = true;
  public noProgress: boolean;

  private _destroy$ = new Subject<boolean>();

  @ViewChild('container') private _container: ElementRef;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _service: TravelerService,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    this.dataSource = Utils.deepCopy(this._dialogPanel.data.travelers);
    this.booker = this._dialogPanel.data.booker;

    this._loadPayments();
  }

  public ngOnInit(): void {
    this.loadInProgress = false;
    this.noProgress = this.dataSource && !this.dataSource.length;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public ngAfterViewInit(): void {
    this._container.nativeElement.focus();
  }

  public ngOnDestroy(): void {
    this.close();
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public onCardChange(traveler: ITraveler, method: IPayment) {
    traveler.payMethod = method;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public onBookerChange(booker: ITraveler) {
    this._dialogPanel.data.booker = booker;
  }

  public trackByFn(index: number): number {
    return index;
  }

  public compareObjects(first: IPayment, second: IPayment): boolean {
    return (first && second) && first.id === second.id;
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

  public save(): void {
    this._dialogPanel.data.travelers = this.dataSource;
    this._dialogPanel.data.overlay.detach();
  }

  private _loadPayments(): void {
    const filter = new Query<PaymentFilter>({
      filter: new PaymentFilter({
        travelerIdIn: this.dataSource.map((item) => item.id),
      }),
    });
    this._service.getPaymentInfo(filter)
    .pipe(takeUntil(this._destroy$))
    .subscribe({
      next: (payments: IPayment[]) => {
        this._setCardMap(payments);
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      },
    });
  }

  private _setCardMap(payments: IPayment[]): void {
    this.cardMap = payments.reduce((map, obj) => {
      !map.get(obj.travelerId) && (map.set(obj.travelerId, []));

      const pays = map.get(obj.travelerId);
      pays.push(obj);

      return map;
    }, new Map());
  }

}
