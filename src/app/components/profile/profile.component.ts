import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewRef
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// external libs
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter, takeUntil } from 'rxjs/operators';

// inner libs
import {
  HttpClientService,
  ICodeNamedEntity,
  IFileInfo,
  INamedEntity,
  Query,
  ReferencesService,
  SysadminVocabularyService,
  ToolbarActionsService,
  UserProfile,
  UserProfileService,
  Utils,
  UtilsService,
  ViewMode,
} from 'h21-be-ui-kit';

// services
import { TimezoneService } from '@core/services';

// environment
import { environment } from '@environments/environment';

// animation
import { ProfileAnimation } from '@animation/profile';

// models
import { TimezoneFilter } from '@core/models/timezone-filter.model';

@Component({
  selector: 'h21-profile',
  templateUrl: './profile.component.html',
  animations: ProfileAnimation,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TimezoneService,
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {

  public viewMode = ViewMode;
  public mode = ViewMode.View;

  public form: FormGroup;

  public now = new Date();

  public importProgress: number;
  public importInProgress: boolean;

  public profile$ = this._userService.profile$;

  public cities$ = new BehaviorSubject<ICodeNamedEntity[]>([]);
  public countries$ = new BehaviorSubject<ICodeNamedEntity[]>([]);
  public languages$ = new BehaviorSubject<ICodeNamedEntity[]>([]);
  public genders$ = new BehaviorSubject<ICodeNamedEntity[]>(this._vocabulary.userGenders);

  public zones$: Observable<INamedEntity[]> = this._timezoneService.getTimezones(
    new Query<TimezoneFilter>({ withCount: false }),
  );

  @ViewChild('importFile') private _importFileInput: ElementRef;

  private _original: UserProfile;
  private _lastSelectedCountryCode: string;
  private _destroy$ = new Subject<boolean>();

  private _isDisabled: string[] = [
    'email', 'countryCode', 'firstName', 'cityCode', 'lastName',
    'timeZoneId', 'middleName', 'phone', 'birthDate', 'languageCode', 'genderId',
  ];

  constructor(private _fb: FormBuilder,
              public utils: UtilsService,
              private _auth: OAuthService,
              private _cdr: ChangeDetectorRef,
              private _http: HttpClientService,
              private _references: ReferencesService,
              private _userService: UserProfileService,
              private _timezoneService: TimezoneService,
              private _toolbarActions: ToolbarActionsService,
              private _vocabulary: SysadminVocabularyService,
  ) {
    this._buildForm();
    this._getLanguages();
    this._getCountries();
    this._getUser();
  }

  public ngOnInit(): void {
    setTimeout(() => this._setToolbarActions(), 0);
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number, item: INamedEntity): number {
    return item.id;
  }

  public onAvatarChanged(file: IFileInfo): void {
    this.form.get('avatar').setValue(file);
  }

  private _getCities(countryCode: string): void {
    this._lastSelectedCountryCode = countryCode;
    this._references.getCountryCities(countryCode)
      .pipe(takeUntil(this._destroy$))
      .subscribe((cities) => this.cities$.next(cities));
  }

  private _getLanguages(): void {
    this._references.getLanguages()
    .pipe(takeUntil(this._destroy$))
    .subscribe((e) => this.languages$.next(e.sort((n1, n2) => n1.name > n2.name ? 1 : -1)));
  }

  private _getCountries(): void {
    this._references.getCountries()
    .pipe(takeUntil(this._destroy$))
    .subscribe((e) => this.countries$.next(e.sort((n1, n2) => n1.name > n2.name ? 1 : -1)));
  }

  private _updateControlAccess(): void {
    this._isDisabled.forEach((control) =>
      this.form.get(control)[this.mode !== ViewMode.View ? 'enable' : 'disable'](),
    );
  }

  private _save(): void {
    if (this.form.invalid) {
      return;
    }
    this.mode = ViewMode.View;
    this._http.post<UserProfile>(`${environment.core.profileApi}userProfile/PostEntity`, this.form.value)
    .subscribe({
      next: (user) => {
        this._original = { ...user };
        this.form.patchValue(user);
        this._userService.profile$.next(user);

        this._setToolbarActions();
        this._updateControlAccess();
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      },
    });
  }

  private _edit(): void {
    this.mode = ViewMode.Edit;
    this._setToolbarActions();
    this._updateControlAccess();
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _cancel(): void {
    this.mode = ViewMode.View;
    this.form.patchValue(this._original);
    this._setToolbarActions();
    this._updateControlAccess();
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _setToolbarActions(): void {
    this._toolbarActions.actions$.next([
      {
        name: 'save',
        disabled: false,
        tooltipText: 'Save',
        icon: 'save',
        action: () => this._save(),
        visible: this.mode !== ViewMode.View,
      },
      {
        name: 'cancel',
        disabled: false,
        tooltipText: 'Cancel',
        icon: 'undo',
        action: () => this._cancel(),
        visible: this.mode !== ViewMode.View,
      },
      {
        name: 'edit',
        disabled: this.mode !== ViewMode.View,
        tooltipText: 'Edit',
        icon: 'edit',
        action: () => this._edit(),
        visible: this.mode !== ViewMode.Add,
      },
    ]);
  }

  private _getUser(): void {
    this._userService.profile$
    .pipe(filter((item) => !!item))
    .subscribe({
      next: (user) => {
        this._original = { ...user };
        this.form.patchValue(user);
        this._getCities(user.countryCode);
        this._initChangeCountryListener();
      },
    });
  }

  private _buildForm(): void {
    this.form = this._fb.group({
      id: new FormControl(),
      code: new FormControl(),
      createUserName: new FormControl(),
      createDate: new FormControl(),
      updateDate: new FormControl(),
      countryCode: new FormControl({ value: null, disabled: true }),
      cityCode: new FormControl({ value: null, disabled: true }),
      timeZoneId: new FormControl({ value: null, disabled: true }, Validators.required),
      birthDate: new FormControl({ value: null, disabled: true }),
      genderId: new FormControl({ value: null, disabled: true }),
      languageCode: new FormControl({ value: null, disabled: true }),
      firstName: new FormControl({ value: null, disabled: true }, Validators.required),
      lastName: new FormControl({ value: null, disabled: true }, Validators.required),
      middleName: new FormControl({ value: null, disabled: true }),
      phone: new FormControl({ value: null, disabled: true }, Validators.pattern(Utils.phoneRegexp)),
      email: new FormControl({ value: null, disabled: true }, Validators.required),
      stateId: new FormControl(),
      avatar: new FormControl(),
      entityRefId: new FormControl(),
      identityUserId: new FormControl(),
      isEmailConfirmed: new FormControl(),
    });
  }

  private _initChangeCountryListener(): void {
    this.form.get('countryCode').valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((countryCode) => {
        if (this._lastSelectedCountryCode !== countryCode) {
          this.form.get('cityCode').setValue(null);
          this.cities$.next([]);
          this._getCities(countryCode);
        }
      });
  }

}
