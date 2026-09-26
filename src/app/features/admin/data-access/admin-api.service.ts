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
  private readonly mockUsers: AdminUser[] = [
    { id: 1, name: 'Alex Johnson', email: 'learner@learnsphere.com', role: 'learner', status: 'Active' },
    { id: 2, name: 'Maya Thompson', email: 'instructor@learnsphere.com', role: 'instructor', status: 'Active' },
    { id: 3, name: 'Jordan Lee', email: 'manager@learnsphere.com', role: 'management', status: 'Active' },
    { id: 4, name: 'Sam Rivera', email: 'admin@learnsphere.com', role: 'admin', status: 'Active' },
    { id: 5, name: 'Priya Nair', email: 'priya.nair@learnsphere.com', role: 'instructor', status: 'Invited' },
  ];
  private readonly mockRoles = [
    { id: 1, name: 'learner', description: 'Consumes learning content and earns certificates', permissions: 12, status: 'Active' },
    { id: 2, name: 'instructor', description: 'Authors courses, assessments, and grades work', permissions: 28, status: 'Active' },
    { id: 3, name: 'management', description: 'Approves programs and reviews learning outcomes', permissions: 36, status: 'Active' },
    { id: 4, name: 'admin', description: 'Full platform, user, and permission control', permissions: 52, status: 'Active' },
  ];
  private readonly mockCatalogue = [
    { id: 101, title: 'Advanced Angular Development', owner: 'Maya Thompson', status: 'Published', health: 'Healthy' },
    { id: 102, title: 'Selenium with Java', owner: 'Daniel Carter', status: 'Published', health: 'Healthy' },
    { id: 104, title: 'API Design Fundamentals', owner: 'Priya Nair', status: 'In review', health: 'Needs review' },
    { id: 105, title: 'Legacy Java Patterns', owner: 'Daniel Carter', status: 'Archived', health: 'Historical' },
  ];
  private readonly mockAudit = [
    { id: 1, event: 'Role permission updated', actor: 'Sam Rivera', area: 'Security', at: 'Today, 10:42 AM', status: 'Logged' },
    { id: 2, event: 'Course published', actor: 'Maya Thompson', area: 'Content', at: 'Today, 09:18 AM', status: 'Logged' },
    { id: 3, event: 'User invitation accepted', actor: 'Jordan Lee', area: 'Users', at: 'Yesterday, 4:02 PM', status: 'Logged' },
    { id: 4, event: 'Course submitted for review', actor: 'Priya Nair', area: 'Content', at: 'Yesterday, 11:27 AM', status: 'Logged' },
  ];

  listUsers(): Observable<AdminUser[]> {
    return environment.useMocks ? of([...this.mockUsers]) : this.api.get<AdminUser[]>('/admin/users');
  }
  getUser(id: number): Observable<AdminUser> {
    if (environment.useMocks) {
      const user = this.mockUsers.find((item) => item.id === id);
      return user ? of(user) : this.api.get<AdminUser>(`/admin/users/${id}`);
    }
    return this.api.get<AdminUser>(`/admin/users/${id}`);
  }
  updateUser(id: number, payload: Partial<AdminUser>): Observable<AdminUser> {
    if (environment.useMocks) {
      const index = this.mockUsers.findIndex((item) => item.id === id);
      if (index < 0) return this.api.put<AdminUser>(`/admin/users/${id}`, payload);
      this.mockUsers[index] = { ...this.mockUsers[index], ...payload };
      return of(this.mockUsers[index]);
    }
    return this.api.put<AdminUser>(`/admin/users/${id}`, payload);
  }
  inviteUser(payload: { email: string; role: string }): Observable<AdminUser> {
    if (environment.useMocks) {
      const created: AdminUser = { id: Math.max(...this.mockUsers.map((user) => user.id)) + 1, name: payload.email.split('@')[0], email: payload.email, role: payload.role, status: 'Invited' };
      this.mockUsers.push(created);
      return of(created);
    }
    return this.api.post<AdminUser>('/admin/users/invite', payload);
  }
  listRoles(): Observable<unknown[]> {
    return environment.useMocks ? of([...this.mockRoles]) : this.api.get<unknown[]>('/admin/roles');
  }
  listCatalogue(): Observable<unknown[]> {
    return environment.useMocks ? of([...this.mockCatalogue]) : this.api.get<unknown[]>('/admin/catalogue');
  }
  listAudit(): Observable<unknown[]> {
    return environment.useMocks ? of([...this.mockAudit]) : this.api.get<unknown[]>('/admin/audit');
  }
}
