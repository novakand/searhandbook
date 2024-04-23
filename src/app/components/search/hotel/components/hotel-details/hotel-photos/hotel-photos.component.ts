import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// external libs
import { Gallery, ImageItem, ImageSize, ThumbnailsMode, ThumbnailsPosition } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';

// interfaces
import { IHotelSearchResultItem } from '@hotel/interfaces';

// services
import { HotelDetailsService } from '@hotel/services';

@Component({
  selector: 'h21-hotel-photos',
  templateUrl: './hotel-photos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelPhotosComponent implements OnInit, OnDestroy {

  @Input() public hotel: IHotelSearchResultItem;

  public maxPhotoCount = 15;
  public galleryId = `lightbox${new Date().getTime()}`;

  public imagesLoaded = false;
  public galleryItems: ImageItem[];

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _gallery: Gallery,
    private _lightbox: Lightbox,
    private _hotelDetailsService: HotelDetailsService,
    private _cd: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    this._getImages();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
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

    this._lightbox.setConfig({
      panelClass: 'fullscreen',
      backdropClass: 'h21-dialog_dark-backdrop',
    });

    lightboxGalleryRef.load(list);
    this.galleryItems = list;
  }

  private _getImages(): void {
    this._hotelDetailsService.getHotelImages(this.hotel.id).pipe(takeUntil(this._destroy$))
      .subscribe((images) => {
        const imageItems: ImageItem[] = images.map(({ fileUrl }) => new ImageItem({ src: fileUrl, thumb: fileUrl }));
        this._initGallery(imageItems);
        this.imagesLoaded = true;
        this._cd.markForCheck();
      });
  }

}
