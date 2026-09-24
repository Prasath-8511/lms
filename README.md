# LearnSphere LMS Frontend

A responsive, role-aware Learning Management System frontend built with **Angular 20.3.9**. The interface follows the supplied `sample ui image` reference: a light navigation rail, wide search header, soft blue/gray surfaces, dashboard metrics, course cards, progress states, and responsive mobile navigation.

The app currently runs in **mock-data mode**, so it can be demonstrated without a backend. The data boundary is already separated into typed models, a store, an HTTP client, and an API-key interceptor so the backend team can connect the real service with a small configuration change.

## Quick start

Prerequisites:

- Node.js supported by Angular 20 (Node 20.11+ or Node 22+ is recommended)
- npm 10+

From the project directory:

```bash
cd lms-frontend
npm install
npm start
```

Open `http://localhost:4200/`. Unauthenticated/new users are sent to `/login`. Use **Create an account** below the login form to register a Learner, Instructor, or Management user. After registration, the app immediately opens the selected role home route.

## Available commands

```bash
npm start              # development server
npm run build          # optimized production build
npm run build:development
npm test               # Karma/Jasmine unit tests
npm run test:ci        # headless Chrome test run
```

The project intentionally does not include `node_modules` in the deliverable archive. Run `npm install` after extracting it.

## Included screens

- Dashboard with learning metrics, continue-learning cards, activity, and next assessment
- Course catalog with search, category filters, enrollment state, and ratings
- Course detail with curriculum, lesson completion, progress, and skills
- My Learning with weekly goal, streak, filters, and progress list
- Assessments with status table and assessment preview dialog
- Certifications with credential cards and verification metadata
- Announcements with categories and upcoming events
- Reports with learning activity, skill focus, and insights
- Help & Support and Settings pages
- Responsive mobile sidebar and global search
- Login, registration, profile, and protected role-aware shell
- Learner dashboard, catalog, course detail, learning, enrollments, player, progress, assessments, attempts, certificates, and reports
- Instructor overview, course studio, course content, assessment authoring, grading, learners, announcements, and reports
- Management overview, program catalog, people/teams, course review, announcements, dashboard, enrollment, and reports
- Admin overview, catalogue governance, users, user details, roles/permissions, audit, and reports
- Reusable shared components, models, pipes, validators, guards, API services, and mock-data mode

## Project structure

```text
lms-frontend/
└─ src/
   └─ app/
      ├─ app.component.ts
      ├─ app.config.ts
      ├─ app.routes.ts
      ├─ core/
      │  ├─ auth/                 # auth state, models, compatibility exports
      │  ├─ config/               # environment/API configuration
      │  ├─ data-access/          # shared HTTP client and learner store
      │  ├─ guards/               # auth, role, active learner, course owner
      │  ├─ interceptors/         # API-key interceptor
      │  ├─ layout/app-shell/     # authenticated application shell
      │  └─ data/                 # mock data used by demo mode
      ├─ shared/
      │  ├─ components/            # icon, feature-page, status, empty, loading, workspace
      │  ├─ models/                # cross-feature UI contracts
      │  ├─ pipes/                 # initials and relative time
      │  └─ validators/            # shared form validators
      └─ features/
         ├─ identity/              # login, register, profile, auth/user services
         ├─ catalogue/             # catalog, course detail, recommendations
         ├─ learner/               # dashboard, learning, enrollments, player,
         │                         # progress, assessments, attempts, certificates
         ├─ instructor/            # courses, content, authoring, grading, announcements
         ├─ management/            # review, announcements, dashboard, enrollment, reports
         ├─ admin/                 # users, roles, catalogue, audit
         └─ shared/                # cross-role announcements and utility pages
```

The older `src/app/pages` folder is no longer used. New feature work should be added under the matching `features/<domain>` folder, with its data-access service in that feature's `data-access` directory.


### New-user registration

The first visit opens `/login`. The **Create an account** link opens `/register`, where a new user can select:

- Learner → `/dashboard`
- Instructor → `/instructor/overview`
- Management → `/management/overview`

Administrator accounts are not self-registered; they are provisioned by an organization administrator. Registration validates name, email, password length, confirmation, duplicate email, and public role selection. Mock registrations are stored under `learnsphere_mock_accounts` in `localStorage` only for local demonstration; replace `AuthService.register()` with the backend registration/session flow for production.

## Demo accounts and role access

The login page includes four mock accounts for local development. All use the password `demo123`.

| Role | Email | Home route | Access |
| --- | --- | --- | --- |
| Learner | `learner@learnsphere.com` | `/dashboard` | Catalog, learning, enrollments, player, progress, assessments, attempts, certificates, reports |
| Instructor | `instructor@learnsphere.com` | `/instructor/overview` | Course studio, content, authoring, grading, learners, announcements, reports |
| Management | `manager@learnsphere.com` | `/management/overview` | Course review, announcements, dashboard, enrollment, reports |
| Admin | `admin@learnsphere.com` | `/admin/overview` | Users, roles, catalogue governance, audit, reports |

Role access is enforced by Angular route guards in `src/app/core/guards/` and reflected in the sidebar through the computed navigation in `src/app/core/layout/app-shell/app-shell.component.ts`. A signed-in user who manually opens another role's URL is redirected to their own home route. Unauthenticated users are redirected to `/login`, with a `returnUrl` query parameter where appropriate.

The current mock authentication uses `sessionStorage` and optionally `localStorage` for the “Keep me signed in” option. It is for frontend demonstration only. Replace it with the backend login/session/JWT flow when the API contract is available; do not treat the mock account list as production authentication.

## Backend integration

Read **[`API_INTEGRATION.md`](API_INTEGRATION.md)** before connecting the backend. It documents:

- environment configuration and mock/live switching
- expected endpoint shapes and response envelopes
- API-key header and session-only key flow
- response-to-UI mapping
- CORS and error handling
- a short integration checklist for the backend handoff

The safest production approach is to have the frontend call a same-origin backend proxy rather than expose a long-lived secret in browser JavaScript.

