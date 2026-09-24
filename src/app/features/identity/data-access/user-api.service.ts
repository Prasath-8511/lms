import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  title?: string;
  initials?: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly api = inject(ApiClientService);
  getMe(): Observable<UserProfile> {
    return environment.useMocks
      ? of({ id: 1, name: 'Alex Johnson', email: 'learner@learnsphere.com', role: 'learner' })
      : this.api.get<UserProfile>('/users/me');
  }
  updateMe(profile: Partial<UserProfile>): Observable<UserProfile> {
    return environment.useMocks ? of(profile as UserProfile) : this.api.put('/users/me', profile);
  }
  getById(id: number): Observable<UserProfile> {
    return this.api.get(`/users/${id}`);
  }
}
