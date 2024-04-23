import { Injectable } from '@angular/core';

// external libs
import { Observable } from 'rxjs';

// inner libs
import { HttpClientService } from 'h21-be-ui-kit';

// interfaces
import { IBookResult, IPaymentResult } from '../transfer/interfaces/index';

// environment
import { environment } from '../../../../environments/environment';

@Injectable()
export class SearchPaymentService {

  constructor(private _http: HttpClientService) { }

  public bookResult(id: string, connectionId: string): Observable<IBookResult> {
    return this._http.get<IBookResult>(`${environment.core.apiRootUrl}Payment/BookResult/${id}/${connectionId}`);
  }

  public paymentResult(id: string): Observable<IPaymentResult> {
    return this._http.get<IPaymentResult>(`${environment.core.apiRootUrl}Payment/PaymentResult/${id}`);
  }

}
