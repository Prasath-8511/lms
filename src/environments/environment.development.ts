export type ApiAuthType = 'api-key' | 'bearer' | 'none';
export type ApiAuthHeader = 'apiKey' | 'bearer' | 'none';

export const environment = {
  production: false,
  useMocks: true,
  apiBaseUrl: 'http://localhost:8080/api',
  apiKey: '',
  apiKeyHeader: 'X-API-Key',
  apiKeyStorageKey: 'learnsphere_api_key',
  authType: 'api-key' as ApiAuthType,
  bearerToken: '',
  bearerTokenStorageKey: 'learnsphere_bearer_token',
};

