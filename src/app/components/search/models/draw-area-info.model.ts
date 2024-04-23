import { AreaEvent, CircleEvent } from 'h21-map';

// enums
import { DrawType } from '@components/search/hotel/enums';

export class DrawAreaInfo {

  public type: DrawType;
  public area: AreaEvent;
  public circle: CircleEvent;

  constructor(obj?: Partial<DrawAreaInfo>) {
    Object.assign(this, obj);
  }

}
