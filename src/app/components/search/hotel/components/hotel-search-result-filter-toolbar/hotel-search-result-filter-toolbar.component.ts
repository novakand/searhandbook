import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

// rxjs
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

// enums
import { CarbonFootprintType, PriceType } from '../../enums';

// models
import { HotelFilterResult } from '@hotel/models';

// services
import { HotelSearchFilterService } from '../hotel-search-result-filter/hotel-search-filter.service';
import { HotelRoomService } from '@hotel/services';

// h21-be-ui-kit
import { Query } from 'h21-be-ui-kit';

@Component({
  selector: 'h21-hotel-search-result-filter-toolbar',
  templateUrl: './hotel-search-result-filter-toolbar.component.html',
  styleUrls: [ './hotel-search-result-filter-toolbar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ HotelSearchFilterService ],
})
export class HotelSearchResultFilterToolbarComponent implements OnInit, OnDestroy {

  public defMaxPrice = 1000;
  public defMaxDistance;

  public filter: HotelFilterResult;
  public priceTypes = PriceType;
  public showFilter: boolean;
  public carbonTypes = CarbonFootprintType;

  private _origin: Query<HotelFilterResult>;
  private _destroy$ = new Subject<boolean>();

  constructor(private _cdr: ChangeDetectorRef, private _service: HotelRoomService) { }

  public ngOnInit(): void {
    this._service.hotelFilter$
      .pipe(
        filter(Boolean),
        tap((data: Query<HotelFilterResult>) => this.defMaxDistance = data.filter.maxDistanceByCar),
        tap((data: Query<HotelFilterResult>) => this._origin = data),
        map((data: Query<HotelFilterResult>) => data.filter),
        takeUntil(this._destroy$),
      )
      .subscribe((data: HotelFilterResult) => {
        this.filter = data;
        this.checkFilter(data);
        this._cdr.detectChanges();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public checkFilter(data: HotelFilterResult): void {
    this.showFilter = this.checkPrice(data)
      || !!data.hotelPossibleRatings.length
      || !!data.minBookingRating
      || !!data.facilities.length
      || data.distanceLessEqual !== this.defMaxDistance
      || !!data.carbonFootprintCodes.length;
  }

  public trackByFn = (index: number): number => index;

  public checkPrice(data: HotelFilterResult): boolean {
    return !!data.priceGreaterEqual || data.priceLessEqual !== this.defMaxPrice;
  }

  public clearFootprint(index: number): void {
    this.filter.carbonFootprintCodes.splice(index, 1);
    this._updateFilter();
  }

  public clearPrice(): void {
    this.filter.priceGreaterEqual = 0;
    this.filter.priceLessEqual = this.defMaxPrice;
    this._updateFilter();
  }

  public clearRating(index: number): void {
    this.filter.hotelPossibleRatings.splice(index, 1);
    this._updateFilter();
  }

  public clearFacilities(index: number): void {
    this.filter.facilities.splice(index, 1);
    this._updateFilter();
  }

  public clearBookingRating(): void {
    this.filter.minBookingRating = null;
    this._updateFilter();
  }

  public clearMaxDistance(): void {
    this.filter.distanceLessEqual = this.defMaxDistance;
    this._updateFilter();
  }

  private _updateFilter(): void {
    this._origin.filter = this.filter;
    this._service.hotelFilter$.next(this._origin);
    this._service.fakeFilter$.next(this._origin);
  }

}
