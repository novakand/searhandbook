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
  ViewRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { IPoiDataAction, MarkerAction } from '@components/search';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// external libs
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// internal libs
import { H21DialogPanelService, IH21DialogPanel, PanelAction, Query, Utils, ViewMode } from 'h21-be-ui-kit';
import { AnimateType, MarkerIconSvg } from 'h21-map';

// models
import { PoiFilter } from '@hotel/components/hotel-poi/poi-filter.model';
import { MarkerActionInfo } from '@search/models';
import { Marker } from '@hotel/models';

// interfaces
import { IRoute } from '@search/interfaces';
import { IPoi } from './poi.interface';

// enums
import { PointType } from '@search/transfer/enums';

// components
import { HotelPoiDialogComponent } from './hotel-poi-dialog';

// services
import { PoiService } from './poi.service';

// environment
import { environment } from '@environments/environment';

@Component({
  selector: 'h21-hotel-poi',
  templateUrl: './hotel-poi.component.html',
  styleUrls: [ './hotel-poi.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PoiService],
})
export class HotelPoiComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public poi: IPoiDataAction;
  @Input() public isMapReady: boolean;

  @Output() public routeReady = new EventEmitter<IRoute>();
  @Output() public setMarkers = new EventEmitter<MarkerActionInfo>();

  public tabletMode: boolean;
  public inProgress: boolean;
  public noProgress: boolean;
  public throttle = 300;

  public viewMode = ViewMode;
  public animateType = AnimateType;
  public poiList$ = new BehaviorSubject<IPoi[]>([]);

  public formFieldAppearance = 'outline';
  public searchCtrl = new FormControl();

  public poiImages: Record<number, Observable<string>> = {};

  private _totalCount: number;
  private _markers: Marker[] = [];
  private _destroy$ = new Subject<boolean>();

  constructor(
    private _service: PoiService,
    private _cdr: ChangeDetectorRef,
    private _breakpointObserver: BreakpointObserver,
    private _dialogPanelService: H21DialogPanelService,
  ) {
    this._breakpointObserver.observe(['(max-width: 1100px)'])
      .subscribe((state: BreakpointState) => {
        this.tabletMode = state.matches;
        this._cdr.markForCheck();
      });
  }

  public ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(300),
        filter((value) => !value || value.length >= 0x3),
        tap(() => this._toggleAnimation(true, false)),
        switchMap((value) => this._getByFilter(value)),
        takeUntil(this._destroy$),
      )
      .subscribe((poiList: IPoi[]) => this._setPoi(poiList));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.poi && changes.poi.currentValue) {
      if (this.poi.action === ViewMode.Add) {
        this.openPoi(this.poi.value, this.poi.action);
      } else {
        const poi = this.poiList$.getValue().find((v) => v.id === this.poi.value.data.id);
        this.openPoi(poi, ViewMode.Edit);
      }
    }

    if (changes.isMapReady && changes.isMapReady.currentValue) {
      this._load();
    }

  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();

    this.routeReady.emit();
  }

  public trackByFn(item: IPoi): number {
    return item.id;
  }

  public onScroll(): void {
    const curCount = this.poiList$.getValue().length;
    if (this._totalCount === curCount) {
      return;
    }
    const searchData = new Query<PoiFilter>(
      {
        filter: { tagsContains: this.searchCtrl.value },
        skip: curCount,
        take: 10,
      });
    this._service.getByFilter(searchData)
      .pipe(
        map((data) => [...data.items, ...this.poiList$.getValue()]),
        takeUntil(this._destroy$),
      )
      .subscribe((poiList: IPoi[]) => this._setPoi(poiList, false));
  }

  public animatePoi(id: number, animate: AnimateType): void {
    const marker = this._markers.find((item) => item.data.id === id);
    marker.animate = AnimateType[animate];
  }

  public isShowActions(id: number): boolean {
    const marker = this._markers.find((item) => item.data.id === id);
    return !!marker.animate;
  }

  public openPoi(data: IPoi, mode: ViewMode): void {
    const panelData: IH21DialogPanel = {
      data: {
        poi: Utils.deepCopy(data),
        mode: mode,
        poiImages: this.poiImages,
      },
    };

    panelData.data.overlay = this._dialogPanelService.open(HotelPoiDialogComponent, panelData);
    const panel$ = panelData.data.overlay.detachments().pipe(takeUntil(this._destroy$));

    panel$.subscribe(() => {
      [PanelAction.SAVE, PanelAction.CLOSE].includes(panelData.data.action) && this._load(this.searchCtrl.value);
    });
  }

  public deletePoi(id: number): void {
    this.inProgress = true;
    this.noProgress = false;

    const delete$ = this._service.deleteById(id)
      .pipe(
        switchMap(() => this._getByFilter(this.searchCtrl.value)),
        takeUntil(this._destroy$),
      );
    delete$.subscribe((poiList: IPoi[]) => this._setPoi(poiList));
  }

  private _load(pattern: string = ''): void {
    this.inProgress = true;
    this.noProgress = false;

    this._getByFilter(pattern)
      .pipe(
        map((list) => list.map((v) => {
          v.arrayTags = v.arrayTags.filter(Boolean);
          return v;
        })),
        takeUntil(this._destroy$),
      )
      .subscribe((poiList: IPoi[]) => this._setPoi(poiList));
  }

  private _setPoi(poiList: IPoi[], init: boolean = true): void {
    this.poiList$.next(poiList);
    this._markers = poiList.map((v) => this._buildMarker(v));
    this.setMarkers.emit(new MarkerActionInfo({
      markers: this._markers,
      action: init ? MarkerAction.CLEAR_AND_ADD : MarkerAction.ADD,
    }));
  }

  private _toggleAnimation(start: boolean, end: boolean): void {
    this.inProgress = start;
    this.noProgress = end;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  private _getByFilter(pattern: string): Observable<IPoi[]> {
    const query = new Query<PoiFilter>({
      filter: new PoiFilter({
        nameOrTagsContains: pattern,
      }),
      withCount: true,
    });

    return this._service.getByFilter(query)
      .pipe(
        tap((data) => {
          this.routeReady.emit();
          const progress = data.items.length === 0;
          this._toggleAnimation(false, progress);
        }),
        tap((result) => this._initImagesRecord(result.items)),
        map((result) => result.items),
      );
  }

  private _buildMarker(data: IPoi): Marker {
    return new Marker({
      iconUrl: `${environment.iconsUri}${MarkerIconSvg.destination}`,
      typePoint: PointType.destination,
      latitude: +data.location.latitude,
      longitude: +data.location.longitude,
      iconHeight: 33,
      fitBounds: true,
      animate: null,
      data: {
        id: data.id,
        hotelName: data.name,
        image: {
          fileHash: data.location.image ? data.location.image.fileHash : null,
          fileUrl: data.location.image ? data.location.image.fileUrl : null,
        },
        hotelAddress: data.location.address,
      },
    });
  }

  private _initImagesRecord(items: IPoi[]): void {
    items.forEach((item) => {
      if (item.location.image && Object.keys(item.location.image).length && item.location.image.fileHash) {
        this.poiImages[item.id] = this._service.loadImg(item.location.image);
      }
    });
  }

}
