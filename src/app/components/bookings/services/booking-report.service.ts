import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClientService, Query } from 'h21-be-ui-kit';

import { environment } from '@environments/environment';

import { BookingDocumentType } from '../enums';

@Injectable()
export class BookingReportService {

  private _orderAPI = environment.apiOrderUri;
  private _orderItemController = 'OrderItem/';

  constructor(private _http: HttpClientService) { }

  public downloadOrderListExcelReport(queryFilter: Query<unknown>): Observable<any> {
    const options: Object = { responseType: 'blob' };
    return this._http.post<any>(`${ this._orderAPI }${ this._orderItemController }GenerateOrderList`, queryFilter, options);
  }

  public getOrderItemReport(orderItemId: number, documentType: BookingDocumentType): Observable<any> {
    const body = { orderItemId: orderItemId, documentType: documentType  };
    const options: Object = { responseType: 'blob' };
    return this._http.post<any>(`${ this._orderAPI }VoucherReport/GetOrderItemReport`, body, options);
  }

  public printData(orderItemId: number, documentType: BookingDocumentType): Observable<Response> {
    const body = { orderItemId, documentType };
    return this._http.post<Response>(`${ environment.core.apiRootUrl }Report/Print`, body);
  }

  public sendEmail(orderItemId: number, documentType: BookingDocumentType): Observable<Response> {
    const body = { orderItemId: orderItemId, documentType: documentType  };
    return this._http.post<Response>(`${ environment.core.apiRootUrl }Report/SendDocumentToEmail`, body);
  }

}
