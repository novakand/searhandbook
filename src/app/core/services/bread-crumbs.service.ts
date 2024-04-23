import { Injectable } from '@angular/core';

import { IBreadcrumb } from 'h21-be-ui-kit';

@Injectable({
  providedIn: 'root',
})
export class BreadCrumbsService {

  public fillBreadCrumbs(url: string, breadcrumbs: IBreadcrumb[]): void {
    const urls: string[] = url.split('/');
    breadcrumbs.length = 0;

    this._fillFirstLevel(urls, breadcrumbs);
    this._fillSecondLevel(urls, breadcrumbs);
    this._fillThirdLevel(urls, breadcrumbs);
  }

  private _fillFirstLevel(urls: string[], breadcrumbs: IBreadcrumb[]): void {
    if (urls.length > 1) {
      breadcrumbs.push({ label: 'Home', url: '/' });
      switch (urls[1]) {
        case 'support':
          breadcrumbs.push({ label: 'Support', url: '/support' });
          break;
        case 'profile':
          breadcrumbs.push({ label: 'My profile', url: '/profile' });
          break;
        case 'company-profile':
          breadcrumbs.push({ label: 'Company profile', url: '/company-profile' });
          break;
        case 'bookings':
          breadcrumbs.push({ label: 'My bookings', url: '/bookings' });
          break;
      }
    }
  }

  private _fillSecondLevel(urls: string[], breadcrumbs: IBreadcrumb[]) {
    if (urls.length > 2) {
      switch (urls[2]) {
        case 'order':
          breadcrumbs.push({ label: 'Order', url: '' });
          break;
      }
    }
  }

  private _fillThirdLevel(urls: string[], breadcrumbs: IBreadcrumb[]) { }

}
