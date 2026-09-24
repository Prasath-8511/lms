import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    localStorage.removeItem('learnsphere_mock_accounts');
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    auth.logout();
  });

  it('logs in each supported demo role and exposes its home route', () => {
    const accounts = [
      ['learner@learnsphere.com', 'learner', '/dashboard'],
      ['instructor@learnsphere.com', 'instructor', '/instructor/overview'],
      ['manager@learnsphere.com', 'management', '/management/overview'],
      ['admin@learnsphere.com', 'admin', '/admin/overview'],
    ] as const;

    for (const [email, role, homeRoute] of accounts) {
      expect(auth.login(email, 'demo123', false)).toBeTrue();
      expect(auth.role()).toBe(role);
      expect(auth.homeRoute()).toBe(homeRoute);
      auth.logout();
    }
  });

  it('rejects invalid credentials', () => {
    expect(auth.login('learner@learnsphere.com', 'wrong-password')).toBeFalse();
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('registers a public user and exposes the correct role home route', () => {
    expect(
      auth.register('Taylor Reed', 'taylor.reed@example.com', 'password123', 'learner'),
    ).toBeTrue();
    expect(auth.role()).toBe('learner');
    expect(auth.homeRoute()).toBe('/dashboard');

    auth.logout();
    expect(auth.login('taylor.reed@example.com', 'password123', false)).toBeTrue();
    expect(auth.user()?.name).toBe('Taylor Reed');
  });

  it('registers instructor and management users to their workspaces', () => {
    expect(
      auth.register('Morgan Lee', 'morgan.lee@example.com', 'password123', 'instructor'),
    ).toBeTrue();
    expect(auth.homeRoute()).toBe('/instructor/overview');

    auth.logout();
    expect(
      auth.register('Jamie Chen', 'jamie.chen@example.com', 'password123', 'management'),
    ).toBeTrue();
    expect(auth.homeRoute()).toBe('/management/overview');
  });

  it('rejects duplicate registration and admin self-registration', () => {
    expect(
      auth.register('Taylor Reed', 'taylor.reed@example.com', 'password123', 'learner'),
    ).toBeTrue();
    expect(
      auth.register('Another Taylor', 'taylor.reed@example.com', 'password123', 'learner'),
    ).toBeFalse();
    expect(
      auth.register('Admin User', 'admin.new@example.com', 'password123', 'admin'),
    ).toBeFalse();
  });

  it('clears both session and remembered authentication state on logout', () => {
    expect(auth.login('admin@learnsphere.com', 'demo123', true)).toBeTrue();
    expect(localStorage.getItem('learnsphere_auth_user')).not.toBeNull();
    auth.logout();
    expect(sessionStorage.getItem('learnsphere_auth_user')).toBeNull();
    expect(localStorage.getItem('learnsphere_auth_user')).toBeNull();
  });
});
