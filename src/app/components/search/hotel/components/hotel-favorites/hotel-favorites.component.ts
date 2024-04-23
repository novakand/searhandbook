import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// external libs
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// internal libs
import { AnimateType, MarkerIconSvg } from 'h21-map';
import { Query } from 'h21-be-ui-kit';

// services
import { SetSearchService } from '@hotel/services';

// environment
import { environment } from '@environments/environment';

// enums
import { MarkerAction } from '@components/search/enums';
import { CarbonFootprintType } from '@hotel/enums';
import { PointType } from '@transfer/enums';

// interfaces
import { IFavorite, IFavoriteFilter } from '@hotel/interfaces';
import { IRoute } from '@search/interfaces';

// models
import { MarkerActionInfo } from '@components/search/models';
import { Marker } from '../../models';

@Component({
  selector: 'h21-hotel-favorites',
  templateUrl: './hotel-favorites.component.html',
  styleUrls: [ './hotel-favorites.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelFavoritesComponent implements OnChanges, OnInit, OnDestroy {

  @Input() public isMapReady: boolean;

  @Output() public routeReady = new EventEmitter<IRoute>();
  @Output() public setMarkers = new EventEmitter<MarkerActionInfo>();

  public tabletMode: boolean;
  public inProgress = true;
  public noProgress: boolean;
  public animateType = AnimateType;

  public carbonFootprintTypes = CarbonFootprintType;
  public destinationCtrl: FormControl = new FormControl('');

  public favorites$ = new BehaviorSubject<IFavorite[]>([]);

  private _totalCount: number;
  private _markers: Marker[] = [];
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _service: SetSearchService,
    private _breakpointObserver: BreakpointObserver,
  ) {
    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        this._cdr.markForCheck();
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.isMapReady && changes.isMapReady.currentValue) {
      this._getFavorites('')
      .pipe(takeUntil(this._destroy$))
      .subscribe((favorites: IFavorite[]) => this._setFavorites(favorites, true));
    }
  }

  public ngOnInit(): void {
    this.destinationCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((value) => !value || value.length >= 0x3),
        tap(() => this._toggleAnimation(true, false)),
        switchMap((value) => this._getFavorites(value)),
        takeUntil(this._destroy$),
      )
      .subscribe((favorites: IFavorite[]) => this._setFavorites(favorites, true));
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
    this.setMarkers.emit(new MarkerActionInfo({
      markers: [],
      action: MarkerAction.CLEAR_AND_ADD,
    }));

    this.routeReady.emit();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public animateFavorite(id: number, animate: AnimateType): void {
    const marker = this._markers.find((item) => item.data.id === id);
    marker && (marker.animate = AnimateType[animate]);
  }

  public cancelFavoriteState(id: number, control: FormControl): void {
    this._toggleAnimation(true, false);

    this._service.deleteFavorite(id)
      .pipe(
        switchMap(() => this._getFavorites(control.value)),
        takeUntil(this._destroy$),
      )
      .subscribe((favorites: IFavorite[]) => this._setFavorites(favorites, true));
  }

  public validateStayGreenCheck(val: any): boolean {
    return typeof val === 'number' && val >= 0 && val < 5;
  }

  private _setFavorites(favorites: IFavorite[], init: boolean): void {
    this._markers = favorites.map((v) => this._buildMarker(v));
    this.setMarkers.emit(new MarkerActionInfo({
      markers: this._markers,
      action: init ? MarkerAction.CLEAR_AND_ADD : MarkerAction.ADD,
    }));
    this.favorites$.next(favorites);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _buildMarker(data: IFavorite): Marker {
    const info = data.hotelGeneralInfo;
    const images = info.fileImages ? info.fileImages[0] : null;
    const languageInfo = info.hotelGeneralInfoLanguages[0];

    return new Marker({
      iconUrl: `${environment.iconsUri}${MarkerIconSvg.favorite}`,
      typePoint: PointType.favorite,
      latitude: info.latitude,
      longitude: info.longitude,
      iconHeight: 24,
      fitBounds: false,
      data: {
        id: data.id,
        isFavorite: data.hotelGeneralInfo.ratings ? data.hotelGeneralInfo.ratings.isFavorite : false,
        hotelName: languageInfo && languageInfo.name,
        image: {
          fileUrl: images && images.url,
        },
        hotelRating: info.ratings && info.ratings.starRating,
        hotelAddress: languageInfo && languageInfo.address,
      },
    });
  }

  private _toggleAnimation(start: boolean, end: boolean): void {
    this.inProgress = start;
    this.noProgress = end;

    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _getFavorites(value: string): Observable<IFavorite[]> {
    const searchData = new Query<IFavoriteFilter>({ filter: { hotelNameContains: value }, withCount: true });

    return this._service.getFavorites(searchData)
      .pipe(
        tap((data) => {
          this._totalCount = data.count;
          const progress = data.items.length === 0;
          this._toggleAnimation(false, progress);
        }),
        map((result) => result.items),
      );
  }

}
