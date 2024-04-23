import { SearchKind } from '@app/enums';

export class LinkInfo {

  public searchKind: SearchKind;
  public destination: string;
  public arrival: string;
  public departure: string;
  public adultsPerRoom: number;
  public amountOfRooms: number;
  public children: number[];

  constructor(obj?: Partial<LinkInfo>) {
    Object.assign(this, obj);
  }

}
