import { SearchMode } from '@components/search';

export class TripInfo {

  public type: SearchMode;
  public trip: any;

  constructor(obj?: Partial<TripInfo>) {
    Object.assign(this, obj);
  }

}
