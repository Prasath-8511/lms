import { Routes } from '@angular/router';
import {
  activeLearnerGuard,
  authGuard,
  courseOwnerGuard,
  guestGuard,
  homeRedirectGuard,
  roleGuard,
} from './core/guards';
import {
  INSTRUCTOR_CATALOG,
  INSTRUCTOR_OVERVIEW,
  INSTRUCTOR_PEOPLE,
  INSTRUCTOR_REPORTS,
} from './features/instructor/data/instructor.data';
import {
  MANAGEMENT_CATALOG,
  MANAGEMENT_OVERVIEW,
  MANAGEMENT_PEOPLE,
  MANAGEMENT_REPORTS,
} from './features/management/data/management.data';
import {
  ADMIN_CATALOG,
  ADMIN_OVERVIEW,
  ADMIN_PEOPLE,
  ADMIN_REPORTS,
} from './features/admin/data/admin.data';

const helpContent = {
  eyebrow: 'We are here to help',
  title: 'Help & Support',
  description: 'Find quick answers, useful resources, and a direct path to the right support team.',
  icon: 'help',
  cards: [
    {
      icon: 'book',
      title: 'Learning guide',
      description:
        'Learn how courses, progress, assessments, and certificates work in LearnSphere.',
      action: 'Read the guide',
    },
    {
      icon: 'users',
      title: 'Community support',
      description: 'Ask questions and learn alongside other members of the LearnSphere community.',
      action: 'Visit community',
    },
    {
      icon: 'clipboard',
      title: 'Technical issue',
      description:
        'Report a problem with a lesson, assessment, certificate, or your learning player.',
      action: 'Troubleshoot',
    },
  ],
};

const settingsContent = {
  eyebrow: 'Make it yours',
  title: 'Settings',
  description: 'Manage your preferences and prepare the frontend for the backend API connection.',
  icon: 'settings',
  cards: [],
};

const roleWorkspace = () =>
  import('./shared/components/workspace-page/workspace-page.component').then(
    (m) => m.RoleWorkspacePage,
  );

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/identity/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/identity/register/register.component').then((m) => m.RegisterPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/identity/profile/profile.component').then((m) => m.ProfilePage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  {
    path: 'courses',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () => import('./features/catalogue/catalog/courses').then((m) => m.CoursesPage),
  },
  {
    path: 'courses/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/catalogue/course-detail/course-detail').then((m) => m.CourseDetailPage),
  },
  {
    path: 'recommendations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/catalogue/recommendations/recommendations.component').then(
        (m) => m.RecommendationsPage,
      ),
  },
  {
    path: 'my-learning',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/my-learning/my-learning').then((m) => m.MyLearningPage),
  },
  {
    path: 'learning',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/learning/learning.component').then((m) => m.LearningPage),
  },
  {
    path: 'enrollments',
    canActivate: [authGuard, roleGuard, activeLearnerGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/enrollments/enrollments.component').then((m) => m.EnrollmentsPage),
  },
  {
    path: 'player',
    canActivate: [authGuard, roleGuard, activeLearnerGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/player/player.component').then((m) => m.PlayerPage),
  },
  {
    path: 'progress',
    canActivate: [authGuard, roleGuard, activeLearnerGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/progress/progress.component').then((m) => m.ProgressPage),
  },
  {
    path: 'learner/enrollments',
    canActivate: [authGuard, roleGuard, activeLearnerGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/enrollments/enrollments.component').then((m) => m.EnrollmentsPage),
  },
  {
    path: 'learner/attempts',
    canActivate: [authGuard, roleGuard, activeLearnerGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/attempts/attempts.component').then(
        (m) => m.AssessmentAttemptsPage,
      ),
  },
  {
    path: 'learner/certificates',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/certificates/certificates.component').then(
        (m) => m.CertificatesPage,
      ),
  },
  {
    path: 'assessments',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/assessments/assessments').then((m) => m.AssessmentsPage),
  },
  {
    path: 'attempts',
    canActivate: [authGuard, roleGuard, activeLearnerGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/attempts/attempts.component').then(
        (m) => m.AssessmentAttemptsPage,
      ),
  },
  {
    path: 'certifications',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/certifications/certifications').then((m) => m.CertificationsPage),
  },
  {
    path: 'certificates',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () =>
      import('./features/learner/certificates/certificates.component').then(
        (m) => m.CertificatesPage,
      ),
  },
  {
    path: 'announcements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shared/announcements/announcements').then((m) => m.AnnouncementsPage),
  },
  {
    path: 'reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['learner'] },
    loadComponent: () => import('./features/learner/reports/reports').then((m) => m.ReportsPage),
  },
  {
    path: 'instructor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['instructor', 'admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', data: { config: INSTRUCTOR_OVERVIEW }, loadComponent: roleWorkspace },
      { path: 'catalog', data: { config: INSTRUCTOR_CATALOG }, loadComponent: roleWorkspace },
      {
        path: 'courses',
        canActivate: [courseOwnerGuard],
        data: { roles: ['instructor'], ownerId: 2 },
        loadComponent: () =>
          import('./features/instructor/courses/instructor-courses.component').then(
            (m) => m.InstructorCoursesPage,
          ),
      },
      {
        path: 'courses/:id/content',
        canActivate: [courseOwnerGuard],
        data: { roles: ['instructor'], ownerId: 2 },
        loadComponent: () =>
          import('./features/instructor/course-content/course-content.component').then(
            (m) => m.CourseContentPage,
          ),
      },
      {
        path: 'courses/:id/assessments',
        canActivate: [courseOwnerGuard],
        data: { roles: ['instructor'], ownerId: 2 },
        loadComponent: () =>
          import('./features/instructor/assessments/assessment-authoring.component').then(
            (m) => m.AssessmentAuthoringPage,
          ),
      },
      {
        path: 'announcements',
        canActivate: [authGuard],
        data: { roles: ['instructor'] },
        loadComponent: () =>
          import('./features/instructor/announcements/instructor-announcements.component').then(
            (m) => m.InstructorAnnouncementsPage,
          ),
      },
      {
        path: 'grading',
        canActivate: [authGuard],
        data: { roles: ['instructor'] },
        loadComponent: () =>
          import('./features/instructor/grading/grading.component').then((m) => m.GradingPage),
      },
      { path: 'people', data: { config: INSTRUCTOR_PEOPLE }, loadComponent: roleWorkspace },
      { path: 'reports', data: { config: INSTRUCTOR_REPORTS }, loadComponent: roleWorkspace },
    ],
  },
  {
    path: 'management',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['management', 'admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', data: { config: MANAGEMENT_OVERVIEW }, loadComponent: roleWorkspace },
      { path: 'catalog', data: { config: MANAGEMENT_CATALOG }, loadComponent: roleWorkspace },
      { path: 'people', data: { config: MANAGEMENT_PEOPLE }, loadComponent: roleWorkspace },
      {
        path: 'course-review',
        canActivate: [authGuard],
        data: { roles: ['management'] },
        loadComponent: () =>
          import('./features/management/course-review/course-review.component').then(
            (m) => m.CourseReviewPage,
          ),
      },
      {
        path: 'announcements',
        canActivate: [authGuard],
        data: { roles: ['management'] },
        loadComponent: () =>
          import('./features/management/announcements/management-announcements.component').then(
            (m) => m.ManagementAnnouncementsPage,
          ),
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        data: { roles: ['management'] },
        loadComponent: () =>
          import('./features/management/dashboard/management-dashboard.component').then(
            (m) => m.ManagementDashboardPage,
          ),
      },
      {
        path: 'enrollments',
        canActivate: [authGuard],
        data: { roles: ['management'] },
        loadComponent: () =>
          import('./features/management/enrollment/management-enrollment.component').then(
            (m) => m.ManagementEnrollmentPage,
          ),
      },
      {
        path: 'reports',
        canActivate: [authGuard],
        data: { roles: ['management'] },
        loadComponent: () =>
          import('./features/management/reports/management-reports.component').then(
            (m) => m.ManagementReportsPage,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', data: { config: ADMIN_OVERVIEW }, loadComponent: roleWorkspace },
      { path: 'catalog', pathMatch: 'full', redirectTo: 'catalogue' },
      {
        path: 'catalogue',
        canActivate: [authGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./features/admin/catalogue/admin-catalogue.component').then(
            (m) => m.AdminCataloguePage,
          ),
      },
      {
        path: 'users',
        canActivate: [authGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersPage),
      },
      {
        path: 'users/:id',
        canActivate: [authGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./features/admin/users/admin-user-detail.component').then(
            (m) => m.AdminUserDetailPage,
          ),
      },
      {
        path: 'roles',
        canActivate: [authGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./features/admin/roles/admin-roles.component').then((m) => m.AdminRolesPage),
      },
      {
        path: 'audit',
        canActivate: [authGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./features/admin/audit/admin-audit.component').then((m) => m.AdminAuditPage),
      },
      { path: 'people', data: { config: ADMIN_PEOPLE }, loadComponent: roleWorkspace },
      { path: 'reports', data: { config: ADMIN_REPORTS }, loadComponent: roleWorkspace },
    ],
  },
  {
    path: 'help-support',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared/utility/utility').then((m) => m.UtilityPage),
    data: { content: helpContent },
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared/utility/utility').then((m) => m.UtilityPage),
    data: { content: settingsContent, mode: 'settings' },
  },
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], loadComponent: roleWorkspace },
  { path: '**', canActivate: [homeRedirectGuard], loadComponent: roleWorkspace },
];
