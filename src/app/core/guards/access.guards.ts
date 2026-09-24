import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const activeLearnerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.role() === 'learner' ? true : router.createUrlTree([auth.homeRoute()]);
};

export const courseOwnerGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ownerId = route.data['ownerId'] as number | undefined;
  return !ownerId || auth.user()?.id === ownerId || auth.role() === 'admin'
    ? true
    : router.createUrlTree([auth.homeRoute()]);
};
