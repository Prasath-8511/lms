import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiBaseUrl,
  useMocks: environment.useMocks,
  apiKeyHeader: environment.apiKeyHeader,
} as const;
