import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewRef
} from '@angular/core';
import { Router } from '@angular/router';

// external libs
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// inner libs
import { AnimationState, ToggleMatExpansionAnimation } from 'h21-be-ui-kit';
import { Position } from 'h21-map';

// services
import { FacilitiesUtils, HotelRoomService, SetSearchService } from '@hotel/services';
import { HistorySearchService, StorageService } from '@core/services';

// enums
import { CarbonFootprintType, PriceType } from '@hotel/enums';

// interfaces
import { IFacilitie, IHotelSearchResultItem, IRoomListBatch } from '@hotel/interfaces';

@Component({
  selector: 'h21-hotel-search-result-item',
  templateUrl: './hotel-search-result-item.component.html',
  animations: [ ToggleMatExpansionAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelSearchResultItemComponent implements OnInit, OnDestroy {

  @Input() public selectedHotelId: number;
  @Input() public item: IHotelSearchResultItem;
  @Input() public items: IHotelSearchResultItem[];
  @Output() public emitItem: EventEmitter<IHotelSearchResultItem> = new EventEmitter<IHotelSearchResultItem>();

  public filter$ = this._hotelService.hotelFilter$;
  public history$ = this._history.current$.pipe(filter(Boolean));
  public isFootprintVisible$ = this._storage.uiSettings$
    .pipe(
      filter(Boolean),
      map((uiSettings) => uiSettings.carbonFootprint),
    );

  public priceType = PriceType;
  public carbonFootprintTypes = CarbonFootprintType;

  public sending: boolean;
  public searchRooms: boolean;
  public showProviderImg = true;
  public detailsVisibility = false;

  public mainFacilities: IFacilitie[];
  public animationState = AnimationState.COLLAPSED;
  public detailsSelectedTab = 0;
  public batchId: string;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _router: Router,
    private _thisRef: ElementRef,
    private _cdr: ChangeDetectorRef,
    private _storage: StorageService,
    private _service: SetSearchService,
    private _history: HistorySearchService,
    private _hotelService: HotelRoomService,
  ) { }

  public ngOnInit(): void {
    FacilitiesUtils.setIcons(this.item.facilities);
    this.mainFacilities = this.item.facilities.filter((v) => v.isVisible);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public redirectToSearch(location: Position): void {
    this._router.navigate(['/search/hotel'], { queryParams: { location: JSON.stringify(location) } });
  }

  public redirectToCard(): void {
    this._hotelService.hotelClick$.next(this.item.id);
  }

  public updateItem(data: IRoomListBatch): void {
    this.searchRooms = false;
    this.batchId = data.batchId;

    const minPrice = Math.min(...data.list.map((v) => v.totalCost));
    const item = data.list.find((v) => v.totalCost === minPrice);

    this.showProviderImg = true;
    (item && item.supplier && !this.item.rooms.supplier.fileName) && (this.item.rooms.supplier = item.supplier);
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

  public trackByFn(index: number): number { return index; }

  public toggleDetailsVisibility(): void {
    this.detailsVisibility = !this.detailsVisibility;
    this.searchRooms = this.detailsVisibility;
    this.animationState = this.detailsVisibility ?  AnimationState.EXPANDED : AnimationState.COLLAPSED;
  }

  public updFavoriteState(item: IHotelSearchResultItem): void {
    item.isFavorite = !item.isFavorite;
    item.isFavorite ? this._addFavorite(item) : this._deleteFavorite(item);
  }

  public validateStayGreenCheck(val: any): boolean {
    return typeof val === 'number' && val >= 0 && val < 5;
  }

  public onHideDetails(): void {
    this.toggleDetailsVisibility();
    this._thisRef.nativeElement.scrollIntoView(true);
  }

  private _addFavorite(item: IHotelSearchResultItem) : void {
    this.sending = true;
    const add$ = this._service.addFavorite(item.id).pipe(takeUntil(this._destroy$));
    add$.subscribe(() => this._onUpdState(item, true));
  }

  private _deleteFavorite(item: IHotelSearchResultItem): void {
    this.sending = true;
    const delete$ = this._service.deleteFavorite(item.id).pipe(takeUntil(this._destroy$));
    delete$.subscribe(() => this._onUpdState(item, false));
  }

  private _onUpdState(item: IHotelSearchResultItem, isFavorite: boolean): void {
    item.isFavorite = isFavorite;
    this.emitItem.emit(item);
    this.sending = false;
    !(<ViewRef>this._cdr).destroyed && this._cdr.detectChanges();
  }

}
