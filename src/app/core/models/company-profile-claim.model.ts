import { OAuthService } from 'angular-oauth2-oidc';

import { CompanyClaim, ICompanyProfileClaim, IIdentityClaims } from 'h21-be-ui-kit';

export class CompanyProfileClaim implements ICompanyProfileClaim {

  private _auth: OAuthService;
  private readonly _UNIQUE = 1;
  private readonly _UNDEFINED = 0;

  constructor(auth: OAuthService) {
    this._auth = auth;
  }

  public getCompanyClaim(): CompanyClaim {
    const claims = <IIdentityClaims>this._auth.getIdentityClaims();
    const companyClaim =
      this._getClaim(claims.agency)
      || this._getClaim(claims.corporate)
      || this._getClaim(claims.horse_company);
    return JSON.parse(companyClaim);
  }

  public isAvailable(): boolean {
    const claims = <IIdentityClaims>this._auth.getIdentityClaims();
    const count =
      this._getCount(claims.agency)
      + this._getCount(claims.corporate)
      + this._getCount(claims.horse_company);

    return count > this._UNIQUE;
  }

  private _getClaim(claims: string | string[]) {
    if (Array.isArray(claims)) {
      return claims[0];
    }
    return claims;
  }

  private _getCount(claims: string | string[]) {
    if (!claims) {
      return this._UNDEFINED;
    }
    if (Array.isArray(claims)) {
      return claims.length;
    }
    return this._UNIQUE;
  }

}
