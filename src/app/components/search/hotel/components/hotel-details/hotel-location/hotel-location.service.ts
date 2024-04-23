import { Injectable, OnDestroy } from '@angular/core';

// external libs
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// internal libs
import { MarkerIconSvg } from 'h21-map';
import { Query } from 'h21-be-ui-kit';

// interfaces
import { IHotelGeneralInfo, IHotelLocationFilter, IHotelSearchResultItem } from '@components/search/hotel/interfaces';
import { IMarker } from '@components/search/interfaces';

// models
import { Marker } from '@components/search/hotel/models';

// services
import { HotelGeneralInfoService } from '@components/search/hotel/services';

// enums
import { PointType } from '@components/search/transfer/enums';

// environment
import { environment } from '@environments/environment';

// components
import { HotelLocationComponent } from './hotel-location.component';

@Injectable()
export class HotelLocationService implements OnDestroy {

  public cmp: HotelLocationComponent;

  private _destroy$ = new Subject<boolean>();

  constructor(private _hotelGI: HotelGeneralInfoService) {}

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public filterByRadius(data: IHotelSearchResultItem): void {
    data.requestId && this._getHotelsByLocation(this._buildFilterHotelsRadius(data));
  }

  public buildMarker(hotel: IHotelSearchResultItem): Marker {
    return new Marker({
      latitude: hotel.hotelLocation.latitude,
      longitude: hotel.hotelLocation.longitude,
      fitBounds: false,
      iconHeight: 33,
      iconUrl: `${environment.iconsUri}${MarkerIconSvg.hotelLocation}`,
      typePoint: PointType.hotelLocation,
      isCluster: false,
      iconZIndex: 1002,
      data: {
        hotelName: hotel.hotelName,
        hotelRating: hotel.hotelRating,
        currency: hotel.rooms && hotel.rooms.currency,
        amount: hotel.rooms && hotel.rooms.minTotalCost,
        supplierName: hotel.rooms && hotel.rooms.supplier && hotel.rooms.supplier.fileName,
        image: {
          fileUrl: hotel.images && hotel.images.length && hotel.images[0].fileUrl,
        },
        hotelAddress: hotel.hotelAddress,
        supplierLogoUrl: hotel.rooms && hotel.rooms.supplier && hotel.rooms.supplier.fileUrl,
      },
    });
  }

  private _buildHotelMarker(hotel: IHotelGeneralInfo): IMarker {
    return {
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      fitBounds: false,
      iconUrl: `${environment.iconsUri}${MarkerIconSvg.hotel}`,
      typePoint: hotel.isFavorite ? PointType.favorite : PointType.hotel,
      iconZIndex: 1001,
      iconHeight: 24,
      isCluster: true,
      data: {
        amount: hotel.amount,
        currency: hotel.currency,
        hotelName: hotel.name,
        hotelRating: hotel.star,
        supplierName: hotel.supplierName,
        image: {
          fileUrl: hotel.smallImage && hotel.smallImage.fileUrl,
        },
        hotelAddress: hotel.address,
        supplierLogoUrl: hotel.supplierLogoUrl,
      },
    };
  }

  private _getHotelsByLocation(query: Query<IHotelLocationFilter>): void {
    const callbackFn = (item) => item.id !== this.cmp.hotelLocationId;
    const byFilter$ = this._hotelGI.hotelListForLocation(query).pipe(
      map((hotels) => hotels && hotels.filter(callbackFn)),
      takeUntil(this._destroy$));
    byFilter$.subscribe((hotels: IHotelGeneralInfo[]) => {
      this._setHotelMarkers(hotels);
    });
  }

  private _setHotelMarkers(hotels: IHotelGeneralInfo[]) {
    const markers = hotels.map((hotel) => this._buildHotelMarker(hotel));
    this.cmp.addMarkers(markers);
  }

  private _buildFilterHotelsRadius(data: IHotelSearchResultItem): Query<IHotelLocationFilter> {
    return new Query<IHotelLocationFilter>({
      filter: {
        geoDistance: {
          centerPoint: {
            latitude: data.hotelLocation.latitude,
            longitude: data.hotelLocation.longitude,
          },
          radius: 3000,
        },
        requestId: data.requestId,
      },
    });
  }

}
