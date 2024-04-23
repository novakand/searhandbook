import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// external libs
import { filter, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

// internal libs
import { CompanyProfileSetting, H21DialogPanelService, IH21DialogPanel, PermissionService, ViewMode } from 'h21-be-ui-kit';

// interfaces
import { ITraveler } from '../../interfaces';

// components
import { SelectTravelerDialogComponent } from '../select-travelers-dialog';
import { TravelersListDialogComponent } from '../travelers-list-dialog';
import { SelectBookerDialogComponent } from '../select-booker-dialog';

@Component({
  selector: 'h21-search-form-toolbar',
  templateUrl: './search-form-toolbar.component.html',
  styleUrls: [ './search-form-toolbar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFormToolbarComponent implements OnDestroy {

  @Input() public selectedTravelers: ITraveler[] = [];
  @Input() public hint: string;
  @Input() public booker: ITraveler;
  @Input() public bookerVisibility: boolean;

  public viewModeType = ViewMode;
  public hasError: boolean;

  public get invalid(): boolean {
    return this.selectedTravelers.length === 0;
  }

  private _profileId: number;
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef,
    private _permissions: PermissionService,
    private _dialogPanelService: H21DialogPanelService,
  ) {
    this.hasError = false;
    this.hint = 'Choose a traveller *';
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public validate(): void {
    this.hasError = this.invalid;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public clearValidate(): void {
    this.hasError = false;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public openTravelersListDialog(mode: ViewMode): void {
    const panelData: IH21DialogPanel = {
      data: {
        travelers: this.selectedTravelers,
        mode: mode,
      },
    };

    panelData.data.overlay = this._dialogPanelService.open(TravelersListDialogComponent, panelData);
    panelData.data.overlay.detachments()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.booker = this.selectedTravelers.find((traveler) => traveler.id === this.booker.id);
          !this.booker && (this.booker = this.selectedTravelers[0]);
          !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
        },
      });
  }

  public onOpenSelectTravelersDialog(): void {
    if (this._profileId) {
      this.openSelectTravelersDialog();
    } else {
      this._getCompanyProfileId()
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (profileId) => {
            this._profileId = profileId;
            this.openSelectTravelersDialog();
          },
        });
    }
  }

  public openSelectTravelersDialog(): void {
    const panelData: IH21DialogPanel = {
      data: {
        selectedTravelers: this.selectedTravelers,
        profileId: this._profileId,
      },
    };

    panelData.data.overlay = this._dialogPanelService.open(SelectTravelerDialogComponent, panelData);
    panelData.data.overlay.detachments()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          if (!this.booker && this.selectedTravelers.length) {
            this.booker = { ...this.selectedTravelers[0] };
          }
          !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
        },
      });
  }

  public openSelectBookerDialog(): void {
    const panelData: IH21DialogPanel = {
      data: {
        travelers: this.selectedTravelers,
        booker: this.booker,
      },
    };
    panelData.data.overlay = this._dialogPanelService.open(SelectBookerDialogComponent, panelData);
    panelData.data.overlay.detachments()
    .pipe(takeUntil(this._destroy$))
    .subscribe({
      next: () => {
        panelData.data.booker && (this.booker = panelData.data.booker);
        this.selectedTravelers = panelData.data.travelers;
        !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
      },
    });
  }

  private _getCompanyProfileId(): Observable<number> {
    return this._permissions.companySetting$
    .pipe(
      filter((v) => !!v),
      map((setting: CompanyProfileSetting) => setting.agentofficeCompanyProfileId),
    );
  }

}
