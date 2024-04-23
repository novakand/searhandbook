import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

// internal libraries
import { CountryType, ICountry, ReferencesService } from 'h21-be-ui-kit';

// interfaces
import { ICompanyProfile } from '../../../interfaces';

@Component({
  selector: 'h21-bookings-customer',
  templateUrl: './bookings-customer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
 })
export class BookingsCustomerComponent implements OnInit {

  @Input() public data: ICompanyProfile;

  public countryType: CountryType;
  public countryTypes = CountryType;
  public country$: Observable<ICountry>;

  constructor(private _reference: ReferencesService) {}

  public ngOnInit(): void {
    this.country$ = this._reference.getCountry(this.data.countryCode);
    this._setCountryType(this.data.countryCode);
  }

  private _setCountryType(country: string): void {
    switch (country) {
      case CountryType.Ru:
        this.countryType = CountryType.Ru;
        break;
      case CountryType.Cn:
        this.countryType = CountryType.Cn;
        break;
      default:
        this.countryType = CountryType.Other;
    }
  }

}
