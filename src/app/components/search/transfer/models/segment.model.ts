export { Location } from './location.model';

export class Segment {

  public id: string;
  public fromLocation: Location;
  public toLocation: Location;
  public fromDate: string;
  public distance: number;
  public duration: number;

}
