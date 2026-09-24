import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserRole } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return !allowedRoles || auth.hasRole(allowedRoles)
    ? true
    : router.createUrlTree([auth.homeRoute()]);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree([auth.homeRoute()]) : true;
};

export const homeRedirectGuard: CanActivateFn = () =>
  inject(Router).createUrlTree([inject(AuthService).homeRoute()]);
