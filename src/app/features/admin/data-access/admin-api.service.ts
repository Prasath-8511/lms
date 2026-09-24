import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiClientService);
  listUsers(): Observable<AdminUser[]> {
    return environment.useMocks ? of([]) : this.api.get<AdminUser[]>('/admin/users');
  }
  getUser(id: number): Observable<AdminUser> {
    return this.api.get(`/admin/users/${id}`);
  }
  updateUser(id: number, payload: Partial<AdminUser>): Observable<AdminUser> {
    return this.api.put(`/admin/users/${id}`, payload);
  }
  listRoles(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/admin/roles');
  }
  listCatalogue(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/admin/catalogue');
  }
  listAudit(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/admin/audit');
  }
}
