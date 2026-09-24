import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const runtimeKey =
    typeof sessionStorage === 'undefined'
      ? null
      : sessionStorage.getItem(environment.apiKeyStorageKey);
  const apiKey = environment.apiKey || runtimeKey;

  if (!apiKey || !request.url.startsWith(environment.apiBaseUrl)) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        [environment.apiKeyHeader]: apiKey,
      },
    }),
  );
};
