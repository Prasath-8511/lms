export type ApiAuthType = 'api-key' | 'bearer' | 'none';
export type ApiAuthHeader = 'apiKey' | 'bearer' | 'none';

export const environment = {
  production: true,
  // Change this to false when the backend API contract is ready.
  useMocks: true,
  apiBaseUrl: 'https://api.example.com/api',
  // Prefer runtime/session configuration or a secure proxy over committing a secret.
  apiKey: '',
  apiKeyHeader: 'X-API-Key',
  apiKeyStorageKey: 'learnsphere_api_key',
  authType: 'api-key' as ApiAuthType,
  bearerToken: '',
  bearerTokenStorageKey: 'learnsphere_bearer_token',
};

