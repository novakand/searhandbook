import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// external libraries
import { Subject } from 'rxjs';

@Component({
  selector: 'h21-payment-failed',
  templateUrl: './payment-failed.component.html',
  styleUrls: [ './payment-failed.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFailedComponent implements OnInit, OnDestroy {

  public label = 'Payment rejected by payment provider.\nCheck card details and try again later.';
  public routerLink: string[];

  private _destroy$ = new Subject<boolean>();

  constructor(private _router: Router) { }

  public ngOnInit(): void {
    this.routerLink = this._getRouterLink();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public payLater(): void {
    // any action
  }

  private _getRouterLink(): string[] {
    return this._router.url.includes('transfer') ? ['/search/transfer'] : ['/search/hotel'];
  }

}
