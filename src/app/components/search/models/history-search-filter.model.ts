import { SearchKind } from '@app/enums';

export class HistorySearchFilter {

  public requestId: string;
  public searchKind: SearchKind;

  constructor(obj?: Partial<HistorySearchFilter>) {
    Object.assign(this, obj);
  }

}
