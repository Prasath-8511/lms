import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthApiService, AuthResponse } from '../../features/identity/data-access/auth-api.service';
import {
  AuthUser,
  PUBLIC_REGISTRATION_ROLES,
  ROLE_HOME,
  ROLE_LABELS,
  UserRole,
} from './auth.models';

interface MockAccount {
  user: AuthUser;
  password: string;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    password: 'demo123',
    user: {
      id: 1,
      name: 'Alex Johnson',
      email: 'learner@learnsphere.com',
      role: 'learner',
      roleLabel: ROLE_LABELS.learner,
      title: 'Software Engineer',
      initials: 'AJ',
    },
  },
  {
    password: 'demo123',
    user: {
      id: 2,
      name: 'Maya Thompson',
      email: 'instructor@learnsphere.com',
      role: 'instructor',
      roleLabel: ROLE_LABELS.instructor,
      title: 'Senior Instructor',
      initials: 'MT',
    },
  },
  {
    password: 'demo123',
    user: {
      id: 3,
      name: 'Jordan Lee',
      email: 'manager@learnsphere.com',
      role: 'management',
      roleLabel: ROLE_LABELS.management,
      title: 'Training Manager',
      initials: 'JL',
    },
  },
  {
    password: 'demo123',
    user: {
      id: 4,
      name: 'Sam Rivera',
      email: 'admin@learnsphere.com',
      role: 'admin',
      roleLabel: ROLE_LABELS.admin,
      title: 'Platform Administrator',
      initials: 'SR',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService, { optional: true });
  private readonly storageKey = 'learnsphere_auth_user';
  private readonly registeredAccountsKey = 'learnsphere_mock_accounts';
  private readonly userState = signal<AuthUser | null>(this.readStoredUser());

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly role = computed<UserRole | null>(() => this.userState()?.role ?? null);

  authenticate(email: string, password: string, remember = true): Observable<boolean> {
    if (environment.useMocks) {
      return of(this.login(email, password, remember));
    }
    if (!this.authApi) {
      return of(false);
    }

    return this.authApi.login({ email: email.trim().toLowerCase(), password, remember }).pipe(
      switchMap((response) => this.resolveApiUser(response)),
      tap(({ user, response }) => {
        this.persistUser(user, remember);
        this.persistRuntimeCredential(response);
      }),
      map(({ user }) => {
        this.userState.set(user);
        return true;
      }),
      catchError(() => of(false)),
    );
  }

  registerAccount(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    remember = true,
  ): Observable<boolean> {
    if (environment.useMocks) {
      return of(this.register(name, email, password, role, remember));
    }
    if (!this.authApi) {
      return of(false);
    }

    return this.authApi
      .register({ name: name.trim(), email: email.trim().toLowerCase(), password, role, remember })
      .pipe(
        switchMap((response) => this.resolveApiUser(response)),
        tap(({ user, response }) => {
          this.persistUser(user, remember);
          this.persistRuntimeCredential(response);
        }),
        map(({ user }) => {
          this.userState.set(user);
          return true;
        }),
        catchError(() => of(false)),
      );
  }

  login(email: string, password: string, remember = true): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.getAccounts().find(
      (candidate) => candidate.user.email === normalizedEmail && candidate.password === password,
    );
    if (!account) {
      return false;
    }

    this.userState.set(account.user);
    this.persistUser(account.user, remember);
    return true;
  }

  /** Mock registration for local development. Replace this method with the backend auth call when ready. */
  register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    remember = true,
  ): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (
      !cleanName ||
      !normalizedEmail ||
      password.length < 8 ||
      !PUBLIC_REGISTRATION_ROLES.includes(role) ||
      this.getAccounts().some((account) => account.user.email === normalizedEmail)
    ) {
      return false;
    }

    const accounts = this.readRegisteredAccounts();
    const user: AuthUser = {
      id: this.nextUserId(),
      name: cleanName,
      email: normalizedEmail,
      role,
      roleLabel: ROLE_LABELS[role],
      title: this.titleForRole(role),
      initials: this.initialsFor(cleanName),
    };
    accounts.push({ user, password });
    this.writeRegisteredAccounts(accounts);
    this.userState.set(user);
    this.persistUser(user, remember);
    return true;
  }

  logout(): void {
    this.userState.set(null);
    this.authApi?.clearRuntimeCredentials();
    if (!environment.useMocks && this.authApi) {
      this.authApi.logout().subscribe({ error: () => undefined });
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.storageKey);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const currentRole = this.role();
    return currentRole !== null && allowedRoles.includes(currentRole);
  }

  homeRoute(): string {
    const currentRole = this.role();
    return currentRole ? ROLE_HOME[currentRole] : '/login';
  }

  roleLabel(): string {
    const currentRole = this.role();
    return currentRole ? ROLE_LABELS[currentRole] : 'Guest';
  }

  private resolveApiUser(
    response: AuthResponse,
  ): Observable<{ user: AuthUser; response: AuthResponse }> {
    const embedded = response.user as Partial<AuthUser> | undefined;
    if (embedded?.id && embedded.email && embedded.role) {
      return of({ user: this.toAuthUser(embedded), response });
    }
    if (!this.authApi) {
      return of({ user: this.toAuthUser(response as Partial<AuthUser>), response });
    }
    return this.authApi.getProfile().pipe(
      map((profile) => ({
        user: this.toAuthUser(profile as Partial<AuthUser>),
        response,
      })),
    );
  }

  private toAuthUser(user: Partial<AuthUser>): AuthUser {
    const role = this.normalizeRole(user.role);
    const name = user.name?.trim() || 'Learner';
    return {
      id: Number(user.id ?? 0),
      name,
      email: user.email ?? '',
      role,
      roleLabel: user.roleLabel ?? ROLE_LABELS[role],
      title: user.title ?? ROLE_LABELS[role],
      initials: user.initials ?? this.initialsFor(name),
    };
  }

  private normalizeRole(role: string | undefined): UserRole {
    const normalized = (role ?? '').toLowerCase().replace(/^role_/, '');
    return normalized in ROLE_HOME ? (normalized as UserRole) : 'learner';
  }

  private persistRuntimeCredential(response: AuthResponse): void {
    if (response.accessToken || response.token) {
      this.authApi?.setRuntimeBearerToken(response.accessToken ?? response.token ?? '');
    } else if (response.apiKey) {
      this.authApi?.setRuntimeApiKey(response.apiKey);
    }
  }

  private getAccounts(): MockAccount[] {
    return [...MOCK_ACCOUNTS, ...this.readRegisteredAccounts()];
  }

  private readRegisteredAccounts(): MockAccount[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const raw = localStorage.getItem(this.registeredAccountsKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as MockAccount[];
      return parsed.filter(
        (account) =>
          account?.user &&
          typeof account.user.email === 'string' &&
          typeof account.password === 'string' &&
          account.user.role in ROLE_HOME,
      );
    } catch {
      localStorage.removeItem(this.registeredAccountsKey);
      return [];
    }
  }

  private writeRegisteredAccounts(accounts: MockAccount[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.registeredAccountsKey, JSON.stringify(accounts));
    }
  }

  private nextUserId(): number {
    return (
      this.getAccounts().reduce((highestId, account) => Math.max(highestId, account.user.id), 0) + 1
    );
  }

  private titleForRole(role: UserRole): string {
    const titles: Record<UserRole, string> = {
      learner: 'Learner',
      instructor: 'Instructor',
      management: 'Management',
      admin: 'Administrator',
    };
    return titles[role];
  }

  private initialsFor(name: string): string {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'LS'
    );
  }

  private readStoredUser(): AuthUser | null {
    if (typeof sessionStorage === 'undefined' && typeof localStorage === 'undefined') {
      return null;
    }
    const storedUser =
      sessionStorage?.getItem(this.storageKey) ?? localStorage?.getItem(this.storageKey);
    if (!storedUser) {
      return null;
    }
    try {
      const parsed = JSON.parse(storedUser) as AuthUser;
      return parsed.role in ROLE_HOME ? parsed : null;
    } catch {
      sessionStorage?.removeItem(this.storageKey);
      localStorage?.removeItem(this.storageKey);
      return null;
    }
  }

  private persistUser(user: AuthUser, remember: boolean): void {
    const serializedUser = JSON.stringify(user);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.storageKey, serializedUser);
    }
    if (remember && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, serializedUser);
    }
  }
}
