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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// external libs
import { BehaviorSubject, forkJoin, fromEvent, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';

// inner libs
import {
  Application,
  CompanySettingService,
  DEFAULT_TABLE_ORDER,
  DIALOG_PANEL_DATA,
  ICompany,
  ICountry,
  IH21DialogPanel,
  IOrder,
  IQueryResult,
  Query,
  ReferencesService,
} from 'h21-be-ui-kit';

// animations
import { ToggleVisibilityAnimation } from '@animation/toggle-visibility';
import { ToggleSlideAnimation } from '@animation/toggle-slide';

// enums
import { AnimationState } from '@app/enums/animation-state';

// services
import { TravelerService } from '@components/search/services';

// environment
import { environment } from 'environments/environment';

// models
import { IDocumentType, ITraveler, ITravelerList } from '../../interfaces/traveler.interface';
import { TravelerFilter } from '@components/search/models';

@Component({
  selector: 'h21-select-traveler-dialog',
  templateUrl: './select-traveler-dialog.component.html',
  styleUrls: ['./select-traveler-dialog.component.scss'],
  animations: [
    ToggleSlideAnimation,
    ToggleVisibilityAnimation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTravelerDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  public documents$: Observable<IDocumentType[]> = this._travelerService.getDocumentType();
  public companies$: Observable<ICompany[]>;
  public nationalities$: Observable<ICountry[]> = this._references.getCountries();
  public isAdmin$ = new BehaviorSubject<boolean>(false);

  public animationState: AnimationState;
  public animationStateChanged = new EventEmitter<AnimationEvent>();
  public form: FormGroup;
  public formFieldAppearance = 'outline';
  public travelers: ITraveler[] = [];
  public selectedTravelers: ITraveler[];
  public inProgress = false;
  public noProgress = false;
  public showEnterHint = false;
  public formVisibility = false;
  public disableRemove = false;

  private _defaultOrder: IOrder = DEFAULT_TABLE_ORDER;
  private _singleSelectMode: boolean;
  private _totalCount: number;
  private search$ = new Subject<Query<TravelerFilter>>();
  private _prevShowEnterHintState = false;
  private _companyProfileIds: number[];
  private _updateOn = 'submit';
  private readonly _profileId: number;
  private _destroy$ = new Subject<boolean>();

  @ViewChild('container') private _container: ElementRef;
  @ViewChild('searchText') private _searchText: ElementRef;

  constructor(private _fb: FormBuilder,
    private _auth: OAuthService,
    private _cdr: ChangeDetectorRef,
    private _references: ReferencesService,
    private _setting: CompanySettingService,
    private _travelerService: TravelerService,
    @Inject(DIALOG_PANEL_DATA) private _dialogPanel: IH21DialogPanel,
  ) {
    this._setIsAdmin();
    this.disableRemove = _dialogPanel.data.disableRemove;
    this._singleSelectMode = !!_dialogPanel.data.singleSelectMode ? _dialogPanel.data.singleSelectMode : false;
    this._profileId = _dialogPanel.data.profileId;
    this.selectedTravelers = _dialogPanel.data.selectedTravelers;
    this._companyProfileIds = _dialogPanel.data.companyProfileIds;

    if (!this._companyProfileIds || !this._companyProfileIds.length) {
      this.selectedTravelers.length && (this._companyProfileIds = this.selectedTravelers[0].companyProfileIds);
    }

    this.companies$ = this._travelerService.getCompanies();
  }

  public ngOnInit(): void {
    this._initSearchListener();
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

  public onScroll(): void {
    if (this._totalCount !== this.travelers.length) {
      const pattern: string = this._searchText.nativeElement.value;
      this.search$.next(this._getFilter(pattern, this.travelers.length));
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }
  }

  public trackByFn(index: number): number {
    return index;
  }

  public search(pattern?: string): void {
    const searchFilter = this._getFilter(pattern);
    this.inProgress = true;
    this.noProgress = false;
    this.travelers = [];
    this.search$.next(searchFilter);

    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public isSelected(traveler: ITraveler): boolean {
    return this.selectedTravelers.findIndex((e) => e.id === traveler.id) >= 0;
  }

  public selectionToggle(traveler: ITraveler, $event: MouseEvent | KeyboardEvent): void {
    const index = this._dialogPanel.data.selectedTravelers.findIndex((e) => e.id === traveler.id);
    if (index === -1) {
      this._dialogPanel.data.selectedTraveler = traveler;
      this._dialogPanel.data.selectedTravelers.push(traveler);
      this._singleSelectMode && this.close();
      if (!this._companyProfileIds) {
        this._companyProfileIds = traveler.companyProfileIds;
        this.search();
      }
    } else {
      if (this.disableRemove) { return; }

      this._dialogPanel.data.selectedTravelers.splice(index, 1);
    }
    const target = $event.target || $event.srcElement || $event.currentTarget;
    this._matCardBlur(target);
  }

  public showForm(): void {
    this.formVisibility = true;
    this._buildForm();
  }

  public onSave(traveler: ITraveler): void {
    this._updateOn = 'blur';

    this._buildForm();
    this.form.patchValue(traveler);

    if (this.form.valid) {
      this.inProgress = true;
      this._saveTraveler();
    }
  }

  public close(): void {
    this._dialogPanel.data.overlay.detach();
  }

  public back(): void {
    this.formVisibility = false;
  }

  public onAnimation(event: AnimationEvent): void {
    this.animationStateChanged.emit(event);
  }

  private _setIsAdmin(): void {
    forkJoin(
      this._setting.isAdminInCompany(),
      of(this._setting.isAdminByClaims()),
    )
      .subscribe({
        next: ([isAdmin, isAdminByClaims]) => {
          this.isAdmin$.next(isAdmin || isAdminByClaims);
        },
      });
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      personalCode: new FormControl(null, Validators.required),
      nationalityCode: new FormControl(null),
      companyProfile: new FormControl(null, Validators.required),
      document: this._fb.group({
        documentTypeId: new FormControl(null, Validators.required),
        documentNumber: new FormControl(null, Validators.required),
      }),
    }, { updateOn: this._updateOn });
  }

  private _saveTraveler(): void {
    const saveTraveler$ = this._travelerService.saveTraveller(this.form.value)
      .pipe(takeUntil(this._destroy$));

    saveTraveler$.subscribe(
      (data) => {
        this.inProgress = false;
        this._dialogPanel.data.selectedTravelers.push(data);
        this._dialogPanel.data.overlay.detach();
        this._updateOn = 'submit';
      },
      () => this.inProgress = false,
    );
  }

  private _initSearchTextListener(): void {
    const keyup$ = fromEvent(this._searchText.nativeElement, 'keyup')
      .pipe(
        debounceTime(environment.debounceTime),
        filter((event: KeyboardEvent) => this._keyupFilter(event)),
        map((event: KeyboardEvent) => (<HTMLInputElement>event.target).value),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      );

    keyup$.subscribe((searchQuery) => this.search(searchQuery));
  }

  private _getFilter(pattern: string, skip: number = 0): Query<TravelerFilter> {
    return new Query<TravelerFilter>({
      withCount: true,
      take: 20,
      skip: skip,
      order: [this._defaultOrder],
      filter: new TravelerFilter({
        expressionNameContains: pattern,
        application: Application.AGENT_OFFICE,
        companyProfileIdIn: this._companyProfileIds,
      }),
    });
  }

  private _showEnterHintHandler(text: string): void {
    this.showEnterHint = text.length && text.length < 3;
    if (this._prevShowEnterHintState !== this.showEnterHint) {
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    }
  }

  private _initSearchListener(): void {
    const search$ = this.search$.pipe(
      switchMap((searchFilter) => this._travelerService.getTravelerListWithAddress(searchFilter)),
      takeUntil(this._destroy$),
    );

    search$.subscribe((data: IQueryResult<ITravelerList>) => {
      this.travelers.push(...data.items);
      !this._totalCount && (this._totalCount = data.count);
      this.inProgress = false;
      this.noProgress = !this.travelers.length;
      !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
    });
  }

  private _keyupFilter(event: KeyboardEvent): boolean {
    const text = (<HTMLInputElement>event.target).value;
    this._showEnterHintHandler(text);
    return event.key === 'Enter' || text.length > 2;
  }

  private _matCardBlur(el: any): void {
    while (el) {
      if (el.tagName.toLowerCase() === 'mat-card') {
        el.blur();
        el = null;
      } else {
        el = el.offsetParent;
      }
    }
  }

}
