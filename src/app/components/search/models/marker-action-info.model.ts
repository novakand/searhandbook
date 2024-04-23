// interfaces
import { IMarker } from '../interfaces/marker.interface';

// enums
import { MarkerAction } from '@components/search';

export class MarkerActionInfo {

  public markers: IMarker[];
  public action: MarkerAction;

  constructor(obj: Partial<MarkerActionInfo>) {
    Object.assign(this, obj);
  }

}
