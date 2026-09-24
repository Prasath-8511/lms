import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { UserProfile } from './user-api.service';

export interface AuthRequest {
  email: string;
  password: string;
  remember?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClientService);

  login(request: AuthRequest): Observable<unknown> {
    return environment.useMocks ? of({ success: true }) : this.api.post('/auth/login', request);
  }

  register(request: AuthRequest & { name: string }): Observable<unknown> {
    return environment.useMocks ? of({ success: true }) : this.api.post('/auth/register', request);
  }

  logout(): Observable<unknown> {
    return environment.useMocks ? of({ success: true }) : this.api.post('/auth/logout', {});
  }

  getProfile(): Observable<UserProfile> {
    return environment.useMocks
      ? of({ id: 1, name: 'Alex Johnson', email: 'learner@learnsphere.com', role: 'learner' })
      : this.api.get<UserProfile>('/users/me');
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return environment.useMocks ? of(profile as UserProfile) : this.api.put('/users/me', profile);
  }
}


