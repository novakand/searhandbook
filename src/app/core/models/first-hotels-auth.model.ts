export class FirstHotelsAuth {

  public h21ProLogin: number;
  public isAuthenticated: boolean;

  constructor(obj: Partial<FirstHotelsAuth>) {
    Object.assign(this, obj);
  }

}
