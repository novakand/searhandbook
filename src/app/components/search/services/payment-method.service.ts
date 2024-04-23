import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

// services
import { HttpClientService, SettingsService } from 'h21-be-ui-kit';

// interfaces
import { IPaymentType, ITraveler } from '@components/search';

// enums
import { PaymentMethod, PaymentType } from '@search/payment/payment.enum';

// env
import { environment } from '@environments/environment';

@Injectable()
export class PaymentMethodService {

  constructor(
    private _http: HttpClientService,
    private _settingsService: SettingsService,
  ) {}

  public async setPaymentMethod(form: FormGroup, selectedTravelers: ITraveler[]): Promise<void> {
    const paymentTypes = await this._getPaymentTypes(form, selectedTravelers);
    const paymentMethod = this._isBankTransferPayment(paymentTypes) ? PaymentMethod.PayLater : PaymentMethod.PayNow;
    form.get('paymentMethod').setValue(paymentMethod);
  }

  private _getCompanyPaymentTypes(): Observable<IPaymentType[]> {
    return this._http.get<IPaymentType[]>(`${environment.core.profileApi}UserProfileSetting/AvailablePaymentTypes`);
  }

  private _isBankTransferPayment(types: IPaymentType[]): boolean {
    return types && types.length === 1 && types[0].paymentTypeCode === PaymentType.BankTransfer;
  }

  private async _getPaymentTypes(form: FormGroup, selectedTravelers: ITraveler[]): Promise<IPaymentType[]> {
    const primaryTravelerId = form.value.travelers.find(({ isPrimary }) => isPrimary).id;
    const travelerTypes = () => selectedTravelers.find(({ id }) => id === primaryTravelerId).paymentTypes;

    return primaryTravelerId ? travelerTypes() : this._getCompanyPaymentTypes().toPromise();
  }

}
