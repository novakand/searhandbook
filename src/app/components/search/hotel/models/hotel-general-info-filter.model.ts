import { GeoBoundingBox } from './geo-bound-box.model';
import { GeoDistance } from './geo-distance.model';
import { GeoPolygon } from './geo-polygon.model';

export class HotelGeneralInfoFilter {

  public geoPolygon: GeoPolygon;
  public geoBoundingBox: GeoBoundingBox;
  public geoDistance: GeoDistance;
  public nameContains: string;
  public nameOrAddressContains: string;
  public languageId: 0;
  public id: number;
  public idIn: number[];

  constructor(obj: Partial<HotelGeneralInfoFilter>) {
    Object.assign(this, obj);
  }

}

export class SortField {

  public field: string;
  public desc: boolean;
  public name: string;

  constructor(field: string, desc: boolean, name: string) {
    this.field = field;
    this.desc = desc;
    this.name = name;
  }

}
