export type UserRole = 'learner' | 'instructor' | 'management' | 'admin';

export interface AuthUser {
  readonly id: number;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  initials: string;
  accessToken?: string;
  apiKey?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  learner: 'Learner',
  instructor: 'Instructor',
  management: 'Management',
  admin: 'Administrator',
};

export const PUBLIC_REGISTRATION_ROLES: readonly UserRole[] = [
  'learner',
  'instructor',
  'management',
];

export const ROLE_HOME: Record<UserRole, string> = {
  learner: '/dashboard',
  instructor: '/instructor/overview',
  management: '/management/overview',
  admin: '/admin/overview',
};
