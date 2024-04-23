import { IReferenceActual } from '@search/payment/interfaces';

export class PaymentBody {

  constructor(public unitId: string,
              public connectionId: string,
              public paymentMethodId: number,
              public referencesActual: IReferenceActual[]) {}

}
