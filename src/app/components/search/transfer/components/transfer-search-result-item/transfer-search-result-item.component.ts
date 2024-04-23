import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

// components
import { PaymentNotAvailableDialogComponent } from '../../../payment/';

// models
import { Route, TransferFilter, Vehicle } from '../../models';

@Component({
  selector: 'h21-transfer-search-result-item',
  templateUrl: './transfer-search-result-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferSearchResultItemComponent implements OnInit {

  @Input() public data: Vehicle;
  @Input() public compactView = false;
  @Input() public filter: TransferFilter;
  @Input() public showBookButton = true;

  public route: Route;
  public talixoLogoUrl = 'assets/img/talixo_logo_web_black.svg';

  constructor(private _router: Router, private _dialog: MatDialog) {}

  public ngOnInit(): void {
    this._setRoute();
  }

  public isTaxi(item: Vehicle): boolean {
    return item.comfortable === 'Taxi';
  }

  public book(): void {
    this._isBookAvailable() ? this._openNotAvailableDialog() : this._navigateToOrder();
  }

  private _openNotAvailableDialog(): void {
    const dialogRef = this._dialog.open(PaymentNotAvailableDialogComponent, {
      data: {},
      disableClose: true,
      autoFocus: false,
      minWidth: '480px',
      maxWidth: '600px',
      backdropClass: 'h21-dialog_dark-backdrop',
      panelClass: 'sb-payment-dialog_panel',
    });

    dialogRef.afterClosed().subscribe(() => {  });
  }

  private _isBookAvailable(): boolean {
    const { cancelPenaltyDate: { year, month, day, hour, minute, second } } = this.data;
    const currentTime = new Date();
    const cancelDate = new Date(year, month, day, hour, minute, second);

    return currentTime.getTime() > cancelDate.getTime();
  }

  private _navigateToOrder(): void {
    const extras: NavigationExtras = { queryParams: { transferId: this.data.transferId } };
    this._router.navigate(['/search/transfer/order'], extras);
  }

  private _setRoute(): void {
    this.filter && (this.route = this.filter.routes[0]);
  }

}
