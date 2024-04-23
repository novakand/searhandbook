// enums
import { PointType } from '@hotel/enums';

// environment
import { environment } from '@environments/environment';

// h21-map
import { MarkerIconSvg, Point } from 'h21-map';

// models
import { Marker } from '@search/hotel/models/marker';

export function buildMarker(data: Point): Marker {
  return new Marker({
    iconUrl: `${environment.iconsUri}${MarkerIconSvg.destination}`,
    typePoint: PointType.destination,
    latitude: +data.position.latitude,
    longitude: +data.position.longitude,
    iconZIndex: 1005,
    iconHeight: 33,
    fitBounds: false,
    animate: null,
    dataPoint: data,
    data: {
      id: +data.id,
      hotelName: data.name,
      image: {
        fileUrl: (data.photos && data.photos[0]) && data.photos[0].url,
      },
      hotelAddress: data.address.description,
    },
  });
}
