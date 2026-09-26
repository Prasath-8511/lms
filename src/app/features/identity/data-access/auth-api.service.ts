import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser } from '../../../core/auth/auth.models';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { UserProfile } from './user-api.service';

export interface AuthResponse {
  user?: Partial<AuthUser>;
  accessToken?: string;
  token?: string;
  apiKey?: string;
  message?: string;
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  roleLabel?: string;
  title?: string;
  initials?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  remember?: boolean;
  name?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClientService);

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', request);
  }

  register(request: AuthRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', request);
  }

  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {});
  }

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/users/me');
  }

  setRuntimeApiKey(value: string): void {
    this.api.setRuntimeApiKey(value);
  }

  setRuntimeBearerToken(value: string): void {
    this.api.setRuntimeBearerToken(value);
  }

  clearRuntimeCredentials(): void {
    this.api.clearRuntimeCredentials();
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.api.put<UserProfile>('/users/me', profile);
  }
}


