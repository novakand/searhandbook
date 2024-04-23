import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// inner libs
import { DrawingModes, MarkerIconSvg, PlaceSubType, Point, Position } from 'h21-map';

// interfaces
import { IDrawingOptions, IMarker } from '@search/interfaces';

// models
import { DrawAreaInfo } from '@search/models/draw-area-info.model';
import { HotelFilter } from '@hotel/models';

// enums
import { PointType } from '@transfer/enums';

// environment
import { environment } from '@environments/environment';

export class HotelSearchBuilder {

  public static buildDrawOptionsByArea(drawInfo: DrawAreaInfo): IDrawingOptions {
    return {
      drawMode: DrawingModes.area,
      markerLatitude: drawInfo.area.center.latitude,
      markerLongitude: drawInfo.area.center.longitude,
      areaCoordinates: drawInfo.area.position,
    };
  }

  public static buildDrawOptionsByRadius(position: Position, drawInfo: DrawAreaInfo): IDrawingOptions {
    return {
      drawMode: DrawingModes.circle,
      markerLatitude: position.latitude,
      markerLongitude: position.longitude,
      circleRadius: drawInfo ? drawInfo.circle.radius : 5000,
    };
  }

  public static buildFilter(form: FormGroup, drawInfo): HotelFilter {
    const destination = form.get('destination').value;
    const filter = new HotelFilter({
      drawInfo: drawInfo,
      arrival: form.get('arrival').value,
      departure: form.get('departure').value,
      point: destination,
      destination: destination && destination.name,
      children: form.get('children').value && form.get('children').value.map((item) => item.age),
      primaryTraveler: form.get('primaryTraveler').value,
    });

    destination && this._fillByDest(destination, filter);
    return filter;
  }

  public static buildForm(fb: FormBuilder): FormGroup {
    return fb.group({
      primaryTraveler: new FormControl(null),
      destination: new FormControl(null, Validators.required),
      arrival: new FormControl(Validators.required),
      departure: new FormControl(null, Validators.required),
      children: fb.array([]),
    });
  }

  public static buildMarker(point: Point): IMarker {
    const icon = point.subtype === 'poi' ? MarkerIconSvg.destination : MarkerIconSvg.hotelLocationSelected;
    return {
      latitude: +point.position.latitude,
      longitude: +point.position.longitude,
      fitBounds: false,
      iconHeight: 33,
      isCluster: false,
      iconUrl: `${environment.iconsUri}${icon}`,
      typePoint: PointType.hotelLocation,
      iconZIndex: 1005,
      data: {
        id: point.id,
        hotelName: point.name,
        image: {
          fileUrl: point.photos[0x0] && point.photos[0x0].url,
        },
        hotelAddress: point.address.description,
      },
    };
  }

  private static _fillByDest(destination: any, filter: HotelFilter): void {
    if (destination.provider === 'horse' && destination.subtype === PlaceSubType.hotel) {
      filter.drawInfo = null;
      filter.hotelId = destination.id;
      sessionStorage.setItem('hotelId', destination.id);
    } else {
      filter.hotelId = null;
      filter.googlePlaceId = destination.googlePlaceId;
    }
  }

}
