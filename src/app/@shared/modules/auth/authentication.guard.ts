import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { LoggerService } from '@app/@shared/services';
import { CredentialsService } from './credentials.service';

const log = new LoggerService('AuthenticationGuard');

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
  constructor(private router: Router, private credentialsService: CredentialsService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    log.debug('canActivate----------------------... => ', this.credentialsService.isAuthenticated());
    if (this.credentialsService.isAuthenticated()) {
      return true;
    }

    log.debug('Not authenticated, redirecting and adding redirect url...');
    // TODO enable this part if you want to enable auth for login.
    // this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
    // return false;
    return true;
  }
}
