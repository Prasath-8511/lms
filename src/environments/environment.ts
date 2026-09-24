export const environment = {
  production: false,
  useMocks: true,
  apiBaseUrl: 'http://localhost:8080/api',
  // Keep real keys out of source control. Prefer a secure backend proxy in production.
  apiKey: '',
  apiKeyHeader: 'X-API-Key',
  apiKeyStorageKey: 'learnsphere_api_key',
};
