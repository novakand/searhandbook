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
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';

// inner libs
import {
  Application,
  CompanySettingService,
  DIALOG_PANEL_DATA,
  IH21DialogPanel,
  Query,
  ReferencesService,
} from 'h21-be-ui-kit';

// animations
import { ToggleSlideAnimation } from '@animation/toggle-slide';

// enums
import { AnimationState } from '@app/enums/animation-state';
import { SearchMode } from '@components/search';

// environment
import { environment } from 'environments/environment';

// interfaces
import { ITripFilter } from '@components/search/hotel/interfaces';
import { ITrip } from '../../interfaces/';

// services
import { SelectTripService } from './select-trip.service';

@Component({
  selector: 'h21-select-trip-dialog',
  templateUrl: './select-trip-dialog.component.html',
  animations: [
    ToggleSlideAnimation,
  ],
  providers: [ SelectTripService ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTripDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();
  public trips$: BehaviorSubject<ITrip[]> = new BehaviorSubject<ITrip[]>([]);
  public inProgress = false;
  public noProgress = false;
  public showEnterHint = false;
  public selectedTripId: number;
  public orderType = SearchMode;

  private _prevShowEnterHintState = false;
  private _focusedItem: ITrip;
  private _destroy$ = new Subject<boolean>();

  @ViewChild('container') private _container: ElementRef;
  @ViewChild('searchText') private _searchText: ElementRef;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _references: ReferencesService,
    private _setting: CompanySettingService,
    private _service: SelectTripService,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {}

  public ngOnInit(): void {
    this.search();
  }

  public ngAfterViewInit(): void {
    this._container.nativeElement.focus();
    this._initSearchTextListener();
  }

  public ngOnDestroy(): void {
    this.close();
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public search(pattern?: string): void {
    const searchFilter = this._getFilter(pattern);
    this._setAnimation(true, false);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();

    this._getTripList(searchFilter);
  }

  public inFocus(trip: ITrip): boolean {
    return this._focusedItem != null && this._focusedItem.id === trip.id;
  }

  public clearFocus(): void {
    this._focusedItem = null;
  }

  public focus(trip: ITrip): void {
    if (this._focusedItem == null || this._focusedItem.id !== trip.id) {
      this._focusedItem = trip;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }
  }

  public select(trip: ITrip): void {
    this._dialogPanel.data.selectedTrip = trip;
    this.close();
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  private _initSearchTextListener(): void {
    const keyup$ = fromEvent(this._searchText.nativeElement, 'keyup')
      .pipe(
        debounceTime(environment.debounceTime),
        filter((event: KeyboardEvent) => {
          const text = (<HTMLInputElement>event.target).value;
          this._showEnterHintHandler(text);
          return event.key === 'Enter' || text.length > 2;
        }),
        map((event: KeyboardEvent) => (<HTMLInputElement>event.target).value),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      );

    keyup$.subscribe((searchQuery) => this.search(searchQuery));
  }

  private _getFilter(pattern?: string): Query<any> {
    return new Query<ITripFilter>({
      withCount: true,
      take: 20,
      filter: {
        idOrNameContains: pattern,
        application: Application.AGENT_OFFICE,
      },
      order: [{ field: 'updateDate', desc: true }],
    });
  }

  private _getTripList(tripFilter: Query<ITripFilter>): void {
    this._service.getTrips(tripFilter)
      .pipe(takeUntil(this._destroy$))
      .subscribe((data: ITrip[]) => {
        this.trips$.next(data);
        this._setAnimation(false, !data.length);
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      });
  }

  private _showEnterHintHandler(text: string): void {
    this.showEnterHint = text.length && text.length < 3;
    this._prevShowEnterHintState !== this.showEnterHint && this._cdr.detectChanges();
  }

  private _setAnimation(inProgress: boolean, noProgress: boolean): void {
    this.inProgress = inProgress;
    this.noProgress = noProgress;
  }

}
