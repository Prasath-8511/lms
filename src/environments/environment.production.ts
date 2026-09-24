export const environment = {
  production: true,
  // Change this to false when the Spring Boot API contract and key are ready.
  useMocks: true,
  apiBaseUrl: 'https://api.example.com/api',
  // Prefer runtime/session configuration or a secure proxy over committing a production key.
  apiKey: '',
  apiKeyHeader: 'X-API-Key',
  apiKeyStorageKey: 'learnsphere_api_key',
};
