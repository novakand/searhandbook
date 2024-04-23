import { H21DateTime } from 'h21-be-ui-kit';

export class Vehicle {

  public transferId: string;
  public segmentId: string;
  public luggageQuantity: number;
  public sportLuggageQuantity: number;
  public maxPassengerQuantity: number;
  public hasPet: boolean;
  public hasWheelChair: boolean;
  public comfortable: any;
  public childrenSeat: string;
  public carModel: string;
  public carColor: string;
  public waitingTime: number;
  public deadTime: number;
  public refundableTime: number;
  public cancelPenaltyCost: number;
  public cancelPenaltyDate: H21DateTime;
  public cost: number;
  public currency: string;
  public isTax: boolean;
  public isTip: boolean;
  public imageUrl: string;
  public bookCode: string;
  public providerName: string;

}
