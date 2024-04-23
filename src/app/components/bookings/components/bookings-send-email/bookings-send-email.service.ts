import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// external libs
import { Observable } from 'rxjs';

// interfaces
import { IEmailInfo } from './email-info.interface';

// environment
import { environment } from '@environments/environment';

@Injectable()
export class BookingsSendEmailService {

  constructor(
    private _http: HttpClient,
  ) { }

  public sendEmail(info: IEmailInfo): Observable<void> {
    return this._http.post<void>(`${environment.apiGatewayUri}Email/SendMyBookingModify`, info);
  }

}
