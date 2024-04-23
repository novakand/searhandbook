export class ShareTrip {

  public email: string;
  public message: string;
  public data: ShareTripInfo;

  constructor(obj: Partial<ShareTrip>) {
    Object.assign(this, obj);
  }

}

class ShareTripInfo {

  public tripId: number;
  public tripName: string;
  public tripLink: string;

  constructor(obj: Partial<ShareTripInfo>) {
    Object.assign(this, obj);
  }

}
