import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

import { IIdentityClaims } from 'h21-be-ui-kit';

@Injectable({
  providedIn: 'root',
})
export class AccessGuard implements CanActivate {

  constructor(private router: Router,
              private authService: OAuthService,
  ) { }

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.isHorseUser()) {
      return true;
    }
    this.router.navigate(['access-denied']).then();
    return false;
  }

  public isHorseUser(): boolean {
    const claims = <IIdentityClaims>this.authService.getIdentityClaims();
    return !!claims.h21pro_user_id;
  }

}
