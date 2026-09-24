# LearnSphere API Integration Guide

This guide explains how to replace the included mock data with the backend API. The UI does not call `HttpClient` directly from page components. Pages consume `LmsStoreService`, so the backend contract can be introduced without rewriting the screens.

## 1. Current data flow

```text
Page component
    ↓ reads signals
LmsStoreService
    ├─ mock mode: mock-data.ts
    └─ api mode: ApiClientService → HttpClient → apiAuthInterceptor → backend
```

The default is deliberately safe:

- `src/environments/environment.ts` is used by local development.
- `src/environments/environment.production.ts` is selected for `ng build`.
- Both default to `useMocks: true`.
- The top bar shows **Demo data** or **Live API** so the active mode is visible.

## 2. Configure the API

Edit the appropriate environment file:

```ts
export const environment = {
  production: false,
  useMocks: false,
  apiBaseUrl: 'https://api.example.com/api',
  apiKey: '',
  apiKeyHeader: 'X-API-Key',
  apiKeyStorageKey: 'learnsphere_api_key',
};
```

| Setting | Purpose |
| --- | --- |
| `useMocks` | `true` uses local fixtures; `false` loads the backend endpoints. |
| `apiBaseUrl` | Base URL without a trailing slash. |
| `apiKey` | Optional local/build-time key. Leave blank when using a proxy or session key. |
| `apiKeyHeader` | Header name expected by the backend, commonly `X-API-Key` or `Authorization`. |
| `apiKeyStorageKey` | Session-storage key used by the Settings page and interceptor. |

After changing `useMocks` to `false`, restart `ng serve` so Angular recompiles the environment replacement.

### Important security note

A browser cannot keep a secret secret. Any key placed in an Angular environment file is shipped to the browser and can be inspected. Use one of these approaches:

1. **Recommended:** use a same-origin backend-for-frontend/proxy. The proxy stores the server key and adds it upstream.
2. **Short-lived development session key:** use the Settings page to save a key in `sessionStorage`; it disappears when the tab session ends.
3. **CI/CD injected configuration:** inject a non-secret base URL at build time and let the backend authenticate the user with a secure cookie or short-lived token.

Never commit a real production secret to `package.json`, `environment.ts`, or a public repository.

## 3. Expected endpoints

The UI uses a feature-owned data-access layer. Each feature service wraps the corresponding backend contract, while `core/data-access/api-client.service.ts` handles the HTTP transport and response envelope.

### Learner and shared services

| Feature service | Methods / paths |
| --- | --- |
| `features/identity/data-access/AuthApiService` | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout` |
| `features/identity/data-access/UserApiService` | `GET/PUT /users/me` |
| `features/catalogue/data-access/CourseCatalogApiService` | `GET /courses`, `GET /courses/:id`, `GET /courses/:id/outline`, `GET /courses/recommended` |
| `features/catalogue/data-access/CatalogueApiService` | `GET /catalogue/search`, `GET /catalogue/categories`, `GET /catalogue/featured` |
| `features/learner/data-access/EnrollmentApiService` | `GET /learner/enrollments`, `POST /courses/:id/enroll`, `GET /learner/enrollments/:id/progress` |
| `features/learner/data-access/AssessmentAttemptApiService` | `GET /learner/assessment-attempts`, `POST /assessments/:id/attempts`, answer/save/submit operations |
| `features/learner/data-access/CertificateApiService` | `GET /certificates`, `GET /certificates/verify/:id`, `GET /certificates/:id/download` |

### Role feature services

| Feature | Service | API areas |
| --- | --- | --- |
| Instructor | `InstructorCourseApiService` | Owned course CRUD and submit-for-review |
| Instructor | `CourseContentApiService` | Modules, lessons, ordering, publishing |
| Instructor | `AssessmentAuthoringApiService` | Assessment and question authoring |
| Instructor | `InstructorAnnouncementApiService` | Instructor announcements |
| Instructor | `GradingApiService` | Assignment and assessment grading |
| Management | `CourseReviewApiService` | Review queue and status changes |
| Management | `ManagementAnnouncementApiService` | Organization announcements |
| Management | `ManagementDashboardApiService` | Dashboard summaries and trends |
| Management | `ManagementReportApiService` | Report generation and download |
| Admin | `AdminApiService` | Users, roles, catalogue, audit events |

The old store endpoints remain available for the learner dashboard:

```text
GET /courses
GET /assessments
GET /certificates
GET /announcements
GET /dashboard/stats
GET /profile
```

The client accepts either a direct payload or this envelope:


```json
{
  "data": [],
  "message": "optional server message"
}
```

If the backend uses a different path, change the service under the owning `features/<domain>/data-access` folder. Keep the page-facing types stable and keep transport details inside the feature service.

## 4. Response mapping

The UI models are in `src/app/shared/models/lms.models.ts`. A course response needs values equivalent to:

```json
{
  "id": 101,
  "title": "Advanced Angular Development",
  "category": "Development",
  "level": "Advanced",
  "description": "Course description",
  "instructor": "Priya Nair",
  "duration": "12h 30m",
  "lessons": 25,
  "completedLessons": 18,
  "progress": 72,
  "rating": 4.9,
  "enrolled": true,
  "icon": "code",
  "color": "blue",
  "tags": ["Angular", "TypeScript"],
  "nextLesson": "Signals and reactive state",
  "status": "Published"
}
```

If the backend field names differ, map them in a private function inside the owning feature service or create a dedicated mapper service there. Keep the page-facing types stable.

```ts
private mapCourse(payload: ApiCourse): Course {
  return {
    id: payload.courseId,
    title: payload.name,
    category: payload.topic,
    level: payload.difficulty,
    // map the remaining fields here
  };
}
```

Do not spread an untrusted API object directly into the UI model. Explicit mapping makes missing fields and future contract changes visible.

## 5. API key flow

`apiAuthInterceptor` adds the key only to requests whose URL starts with `apiBaseUrl`:

```ts
request.clone({
  setHeaders: {
    [environment.apiKeyHeader]: apiKey,
  },
});
```

The Settings page can save a temporary key through `ApiClientService.setRuntimeApiKey()`. For `Authorization: Bearer <token>`, set `apiKeyHeader` to `Authorization` and enter the complete header value, or update the interceptor to build the Bearer value from a token field.

If the backend uses cookies instead, enable credentials only if the deployment requires it:

```ts
provideHttpClient(withInterceptors([apiAuthInterceptor]), withCredentials())
```

Only use that after coordinating the backend CORS policy and deciding whether credentials are truly needed.

## 6. CORS and local development

For a local Spring Boot service on port `8080`, the backend must allow the Angular origin:

```text
http://localhost:4200
```

Typical development CORS configuration:

```java
@CrossOrigin(origins = "http://localhost:4200")
```

Use a configuration property rather than committing production origins. If the API is deployed under the same site, a reverse proxy avoids CORS entirely.

## 7. Error and loading behavior

`LmsStoreService` currently falls back to the corresponding mock collection when an individual GET fails. This makes the UI demo resilient while the backend is being developed. For production, replace that fallback with a visible error state or a retry action appropriate to the product requirement.

Recommended error handling:

- 401/403: clear the session key and redirect to login.
- 404: show an empty/not-found state for the requested resource.
- 409: show a conflict message for duplicate enrollment or assessment submission.
- 429: show a retry-later message.
- 5xx/network: show a retry button and log details to the monitoring system.

## 8. Write operations

The current mock UI updates enrollment and lesson completion locally through `LmsStoreService`. When the backend is connected, add write calls to the owning feature service (for example, `EnrollmentApiService` or `AssessmentAttemptApiService`) using the existing client:

```ts
this.api.post<void>('/courses/101/enroll', {});
this.api.put<void>('/lessons/1104/complete', { completed: true });
```

Optimistically update the signal first, then roll it back if the request fails. Do not put API calls in templates or page click handlers; the service boundary is the intended extension point.

## 9. Handoff checklist

Ask the backend team for:

- [ ] Base URL for each environment
- [ ] Exact authentication header and key/token lifetime
- [ ] Endpoint paths and HTTP methods
- [ ] Request and response examples for courses, modules, lessons, assessments, certificates, announcements, profile, and stats
- [ ] Whether responses are direct or wrapped in `{ "data": ... }`
- [ ] Error response format and status-code policy
- [ ] CORS policy or recommended proxy path
- [ ] Pagination/filter/sort parameters
- [ ] Write endpoints for enrollment, lesson completion, assessment submission, and certificate retrieval
- [ ] Test credentials and a non-production data set

## 10. Authentication and role handoff

The frontend includes a login and new-user registration flow. An unauthenticated user who opens `/` or any protected route is sent to `/login`. The login page links to `/register`; a successful registration automatically routes to the selected public role home:

- Learner → `/dashboard`
- Instructor → `/instructor/overview`
- Management → `/management/overview`

Administrator accounts are intentionally not available through public self-registration. Replace the mock account lookup and `AuthService.register()` in `src/app/core/auth/auth.service.ts` with the backend login/registration/session flow when the API contract is available.

### Demo accounts

All local demo accounts use password `demo123`:

- `learner@learnsphere.com` → `/dashboard`
- `instructor@learnsphere.com` → `/instructor/overview`
- `manager@learnsphere.com` → `/management/overview`
- `admin@learnsphere.com` → `/admin/overview`

### Access matrix

| Role | Protected areas |
| --- | --- |
| Learner | `/dashboard`, `/courses`, `/courses/:id`, `/recommendations`, `/my-learning`, `/learning`, `/enrollments`, `/player`, `/progress`, `/assessments`, `/attempts`, `/certificates`, `/certifications`, `/reports` |
| Instructor | `/instructor/overview`, `/instructor/catalog`, `/instructor/courses`, `/instructor/courses/:id/content`, `/instructor/courses/:id/assessments`, `/instructor/announcements`, `/instructor/grading`, `/instructor/people`, `/instructor/reports` |
| Management | `/management/overview`, `/management/catalog`, `/management/people`, `/management/course-review`, `/management/announcements`, `/management/dashboard`, `/management/enrollments`, `/management/reports` |
| Admin | `/admin/overview`, `/admin/catalogue`, `/admin/users`, `/admin/users/:id`, `/admin/roles`, `/admin/audit`, `/admin/people`, `/admin/reports` |

All authenticated roles can also open shared pages such as `/announcements`, `/help-support`, and `/settings`. `authGuard` handles unauthenticated redirects, `roleGuard` handles role authorization, and `guestGuard` prevents an authenticated user from seeing the login page.

### Production authentication checklist

- [ ] Decide whether the backend uses a secure HTTP-only cookie, short-lived access token, or a backend proxy.
- [ ] Replace the mock `login()` and `register()` methods with the agreed endpoints.
- [ ] Map the backend user response to `AuthUser` (`id`, `name`, `email`, `role`, `roleLabel`, `title`, `initials`).
- [ ] Keep role checks on the backend; frontend guards are a UX layer, not a security boundary.
- [ ] Clear invalid/expired sessions on 401 responses.
- [ ] Confirm logout invalidates the server session/token.
- [ ] Avoid storing long-lived secrets in `localStorage`.

### First integration test

1. Set `useMocks: false` and configure `apiBaseUrl`.
2. Start the Angular dev server.
3. Open the browser Network panel and verify each endpoint is called once.
4. Confirm the top bar reads **Live API**.
5. Test a successful list response, a 401, a 500, and an empty response.
6. Test enrollment and lesson completion write operations.
7. Build with `npm run build` before handoff.

