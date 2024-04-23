import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// services
import { FacilitiesUtils, HotelDetailsService } from '@hotel/services';

// interfaces
import { IFacilitie, IHotelSearchResultItem } from '@hotel/interfaces';

@Component({
  selector: 'h21-hotel-info',
  templateUrl: './hotel-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HotelDetailsService],
})
export class HotelInfoComponent implements OnInit, OnDestroy {

  @Input() public info: IHotelSearchResultItem;
  public mainFacilities: IFacilitie[] = [];
  public optionalFacilities: IFacilitie[] = [];
  public descriptionLoaded = false;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _hotelDetailsService: HotelDetailsService,
    private _cd: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    this.info.facilities && this._setFacilities();
    this._getDescription();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public trackByFn(index: number): number {
    return index;
  }

  private _setFacilities(): void {
    FacilitiesUtils.setIcons(this.info.facilities);

    this.info.facilities.forEach((facility) => {
      facility.isVisible ? this.mainFacilities.push(facility) : this.optionalFacilities.push(facility);
    });
  }

  private _getDescription(): void {
    this._hotelDetailsService.getHotelDescription(this.info.id).pipe(takeUntil(this._destroy$))
      .subscribe((description) => {
        this.info.hotelDescription = description;
        this.descriptionLoaded = true;
        this._cd.markForCheck();
      });
  }

}
