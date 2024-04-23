import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// enums
import { SearchMode } from '@search/enums';

@Injectable()
export class PaymentNavigateService {

  constructor(private _router: Router) {}

  public redirectToPayVision(type: SearchMode | string): void {
    this._router.navigateByUrl(`search/${type}/payment`);
  }

}
