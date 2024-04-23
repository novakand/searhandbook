export class TransferFilterResult {

  public requestId: string;
  public comfortableList: any[];
  public minCost: number | string;
  public maxCost: number | string;

  constructor(obj?: Partial<TransferFilterResult>) {
    Object.assign(this, obj);
  }

}
