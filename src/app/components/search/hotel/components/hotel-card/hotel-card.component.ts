import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// external libs
import { Gallery, ImageItem, ImageSize, ThumbnailsMode, ThumbnailsPosition } from '@ngx-gallery/core';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { Lightbox } from '@ngx-gallery/lightbox';

// internal libs
import { H21TwoMonthCalendarComponent } from 'h21-be-ui-kit';
import { MarkerIconSvg } from 'h21-map';

// services
import { HotelGeneralInfoService, HotelRoomService, SetSearchService } from '../../services';
import { HistorySearchService, StorageService } from '@core/services';

// enums
import { CarbonFootprintType } from '../../enums';

// models
import { HotelFilter } from '../../models';

// interfaces
import { IHotel } from '../../interfaces';

// environment
import { environment } from '@environments/environment';

@Component({
  selector: 'h21-hotel-card',
  templateUrl: './hotel-card.component.html',
  styleUrls: [ './hotel-card.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelCardComponent implements OnInit, OnDestroy {

  @ViewChild('calendar') set calendar(element: H21TwoMonthCalendarComponent) {
    if (element && !this._calendar) {
      this._calendar = element;
      this.getBatchId();
    }
  }

  public sending: boolean;
  public picturesCount = [ 1, 2, 3, 4 ];
  public formFieldAppearance = 'outline';
  public carbonFootprintTypes = CarbonFootprintType;
  public selectedTabIndex = 0;
  public galleryId = 'lightbox';
  public galleryItems: ImageItem[];

  public batchId: string;
  public filter: HotelFilter;

  public isFootprintVisible$ = this._storage.uiSettings$
    .pipe(
      filter(Boolean),
      map((uiSettings) => uiSettings.carbonFootprint),
    );

  public hotelImgUrl: string;
  public hotel$ = new BehaviorSubject<IHotel>(null);

  private _calendar: H21TwoMonthCalendarComponent;
  private _destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _gallery: Gallery,
    private _lightBox: Lightbox,
    private _cdr: ChangeDetectorRef,
    private _rooms: HotelRoomService,
    private _storage: StorageService,
    private _activated: ActivatedRoute,
    private _service: SetSearchService,
    private _history: HistorySearchService,
    private _hotels: HotelGeneralInfoService,
  ) { }

  public ngOnInit(): void {
    this._load();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public onClickImage(): void {
    this.selectedTabIndex = 2;
  }

  public validateStayGreenCheck(val: any): boolean {
    return typeof val === 'number' && val >= 0 && val < 5;
  }

  public updFavoriteState(): void {
    this.hotel$.value.isFavorite = !this.hotel$.value.isFavorite;
    this.hotel$.value.isFavorite ? this._addFavorite() : this._deleteFavorite();
  }

  public getBatchId(override = false): void {
    this._calendar.validate();
    if (this._calendar.invalid) { return; }

    this.batchId = null;

    const batchId = this._activated.snapshot.queryParams.roomsBatchId;
    if (batchId && !override) {
      this.batchId = batchId;
      return;
    }

    this.sending = true;

    const batch$ = this._rooms.getHotelRoomsBatchByHotelId(this.filter).pipe(takeUntil(this._destroy$));
    batch$.subscribe((batch) => {
      this.batchId = batch;
      this.sending = false;
      this._cdr.detectChanges();
    });
  }

  private _load(): void {
    const requests$ = forkJoin(
      this._hotels.getById(+this._activated.snapshot.queryParams.id),
      this._history.getById(this._activated.snapshot.queryParams.historyId),
    ).pipe(
      tap(([hotel, _]) => this._mapImagesAndInit(hotel)),
      tap(([hotel, _]) => this._mapLoadListener(hotel)),
      tap(([_, history]) => history.hotel.hotelId = +this._activated.snapshot.queryParams.id),
      tap(([_, history]) => this._history.current$.next(history.hotel)),
      takeUntil(this._destroy$),
    );

    requests$.subscribe(([hotel, history]) => {
      this.hotel$.next(hotel);
      this.filter = history.hotel;
    });
  }

  private _mapLoadListener(hotel: IHotel): void {
    const loaded$ = this._storage.manager$
      .pipe(
        filter((v) => !!v),
        takeUntil(this._destroy$),
      );
    loaded$.subscribe(() => {
      const { latitude, longitude } = hotel.hotelLocation;
      this.hotelImgUrl =  this._storage.manager$.value.getMap()
        .getStaticUrl(latitude, longitude, `${environment.iconsUri}${MarkerIconSvg.hotelLocationStatic}`);
      this._cdr.detectChanges();
    });
  }

  private _mapImagesAndInit(hotel: IHotel): void {
    if (hotel.images && hotel.images.length) {
      const pictures = hotel.images.map((v) => new ImageItem({ src: v.fileUrl, thumb: v.fileUrl }));
      this._initGallery(pictures);
    }
  }

  private _addFavorite() : void {
    this.sending = true;
    const add$ = this._service.addFavorite(this.hotel$.value.id).pipe(takeUntil(this._destroy$));
    add$.subscribe(() => this._onUpdState(true));
  }

  private _deleteFavorite(): void {
    this.sending = true;
    const delete$ = this._service.deleteFavorite(this.hotel$.value.id).pipe(takeUntil(this._destroy$));
    delete$.subscribe(() => this._onUpdState(false));
  }

  private _onUpdState(isFavorite: boolean): void {
    this.hotel$.value.isFavorite = isFavorite;
    this.sending = false;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _initGallery(list: ImageItem[]): void {
    const lightboxGalleryRef = this._gallery.ref(this.galleryId);

    lightboxGalleryRef.setConfig({
      thumbMode: ThumbnailsMode.Strict,
      imageSize: ImageSize.Contain,
      thumbPosition: ThumbnailsPosition.Bottom,
      thumbWidth: 54,
      thumbHeight: 54,
      loadingMode: 'indeterminate',
    });

    this._lightBox.setConfig({
      panelClass: 'fullscreen',
      backdropClass: 'h21-dialog_dark-backdrop',
    });

    lightboxGalleryRef.load(list);
    this.galleryItems = list;
  }

}
