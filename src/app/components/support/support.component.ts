import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

// interfaces
import { ISupportPhones } from './suport-phones.interface';
// libs
import { Utils } from 'h21-be-ui-kit';

@Component({
  selector: 'h21-support',
  templateUrl: './support.component.html',
})
export class SupportComponent {

  public title = '24/7 support';

  public supportEmails: any[];
  public supportPhones: ISupportPhones[];

  constructor(private _http: HttpClient) {

    this._http.get<any>('./data_storage/support_emails.json')
      .subscribe({ next: (data) => { this.supportEmails = data; } });

    this._http.get<any>('./data_storage/support_phones.json')
      .subscribe({ next: (data) => { this.supportPhones = data; } });
  }

  public trackByFn(index) {
    return index;
  }

  public getDashboardEmailLink(email: string): string {
    return Utils.getSupportEmailLink(email);
  }

}
