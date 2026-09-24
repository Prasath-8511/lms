import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard, guestGuard, homeRedirectGuard, roleGuard } from './auth.guards';
import { routes } from '../../app.routes';

describe('auth guards', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    auth.logout();
  });

  afterEach(() => auth.logout());

  it('redirects an unauthenticated user to login with a return URL', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/admin/overview' } as RouterStateSnapshot),
    );
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
  });

  it('redirects a learner away from the admin area', () => {
    auth.login('learner@learnsphere.com', 'demo123', false);
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(
        { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('allows the correct role and redirects authenticated users away from login', () => {
    auth.login('instructor@learnsphere.com', 'demo123', false);
    const allowed = TestBed.runInInjectionContext(() =>
      roleGuard(
        { data: { roles: ['instructor'] } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
    const guestResult = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(allowed).toBeTrue();
    expect(guestResult instanceof UrlTree).toBeTrue();
  });

  it('uses the signed-in role home route for root navigation', () => {
    auth.login('manager@learnsphere.com', 'demo123', false);
    const result = TestBed.runInInjectionContext(() =>
      homeRedirectGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(router.serializeUrl(result as UrlTree)).toBe('/management/overview');
  });

  it('redirects a new unauthenticated user from root to login', () => {
    const result = TestBed.runInInjectionContext(() =>
      homeRedirectGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
