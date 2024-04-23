import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

// external operators
import { Observable } from 'rxjs';

// environment
import { environment } from '@environments/environment';

// interfaces
import { ITrip, ITripSegment } from '@core/interfaces';
import * as moment from 'moment';
import { BookingItem } from '@components/bookings';

@Injectable()
export class ReportService {

  public _renderer: Renderer2;

  constructor(
    private _http: HttpClient,
    private _rendererFactory: RendererFactory2,
  ) {
    this._renderer = _rendererFactory.createRenderer(null, null);
  }

  public getTrip(tripId: number): Observable<ITrip> {
    const params = new HttpParams().set('id', String(tripId));
    return this._http.get<ITrip>(`${environment.apiOrderUri}Trip/Get`, { params });
  }

  public downloadVoucher(order: any, isSave: boolean): void {
    const id = order.orderItemId || order.id;
    this._getVoucher(id).subscribe((data) =>
      isSave ? this._savePdf(data, 'voucher', order) : this._openPdf(data),
    );
  }

  public downloadBillingDetails(order: any, isSave: boolean): void {
    const id = order.orderItemId || order.id;
    this._getBillingDetails(id).subscribe((data) => {
      isSave ? this._savePdf(data, 'billing_details', order) : this._openPdf(data);
    });
  }

  public addCancellationClass(segments: ITripSegment[]): void {
    segments.forEach((segment) => segment.cancellationClass = this._getCancellationTermClass(segment));
  }

  private _getVoucher(id: number): Observable<string> {
    const params = new HttpParams().set('orderItemId', String(id));
    const options: Object = { responseType: 'text', params };
    return this._http.get<string>(`${environment.apiOrderUri}VoucherReport/VoucherBase64Print`, options);
  }

  private _getBillingDetails(id: number): Observable<string> {
    const params = new HttpParams().set('orderItemId', String(id));
    const options: Object = { responseType: 'text', params };
    return this._http.get<string>(`${environment.apiOrderUri}BillDetails/PrintBase64String`, options);
  }

  private _savePdf(data: string, type: string, order: BookingItem): void {
    const element = this._renderer.createElement('a');
    const linkSource = `data:application/pdf;base64, ${data}`;
    const fileName = `${type === 'voucher' ? 'Voucher' : 'Billing_details' }_${order.viewOrderNumber}.pdf`;
    this._renderer.setAttribute(element, 'href', linkSource);
    this._renderer.setAttribute(element, 'download', fileName);
    element.click();
  }

  private _getCancellationTermClass(data: ITripSegment): string {
    if (data.nonRefundable) {
      return '__color-red';
    } else if (data.cancellationDeadTime) {
      const now = moment().utc();
      const cancelDay = moment(data.cancellationDeadTime).utc();
      return now.isSameOrBefore(cancelDay) ? '__color-green' : '__color-red';
    }
  }

  private _openPdf(data: string): void {
    const win = window.open('', '_blank');
    // tslint:disable
    const html = '<html>' +
      '<body style="margin:0!important">' +
      '<embed width="100%" height="100%" src="data:application/pdf;base64,' + data + '" type="application/pdf" />' +
      '</body>' +
      '</html>';
    // tslint:enable

    setTimeout(() => win.document.write(html), 0);
  }


}
