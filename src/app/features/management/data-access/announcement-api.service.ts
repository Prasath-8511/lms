import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagementAnnouncementApiService {
  private readonly api = inject(ApiClientService);
  list(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/management/announcements');
  }
  create(announcement: unknown): Observable<unknown> {
    return this.api.post('/management/announcements', announcement);
  }
  update(id: number, announcement: unknown): Observable<unknown> {
    return this.api.put(`/management/announcements/${id}`, announcement);
  }
  publish(id: number): Observable<unknown> {
    return this.api.post(`/management/announcements/${id}/publish`, {});
  }
}
