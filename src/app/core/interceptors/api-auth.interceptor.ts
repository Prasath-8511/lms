import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const apiAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  if (!isApiRequest || environment.authType === 'none') {
    return next(request);
  }

  const runtimeApiKey = sessionStorage?.getItem(environment.apiKeyStorageKey) ?? null;
  const runtimeToken = sessionStorage?.getItem(environment.bearerTokenStorageKey) ?? null;
  const headers: Record<string, string> = {};

  if (environment.authType === 'api-key') {
    const apiKey = environment.apiKey || runtimeApiKey;
    if (apiKey) {
      headers[environment.apiKeyHeader] = apiKey;
    }
  }
  if (environment.authType === 'bearer') {
    const token = environment.bearerToken || runtimeToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const authenticatedRequest = Object.keys(headers).length
    ? request.clone({ setHeaders: headers })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('/auth/login')) {
        sessionStorage?.removeItem('learnsphere_auth_user');
        localStorage?.removeItem('learnsphere_auth_user');
        void router.navigate(['/login'], {
          queryParams: { returnUrl: router.url, sessionExpired: 'true' },
        });
      }
      return throwError(() => error);
    }),
  );
};
