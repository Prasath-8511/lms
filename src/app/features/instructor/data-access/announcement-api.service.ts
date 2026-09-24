import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InstructorAnnouncementApiService {
  private readonly api = inject(ApiClientService);
  list(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/instructor/announcements');
  }
  create(announcement: unknown): Observable<unknown> {
    return this.api.post('/instructor/announcements', announcement);
  }
  update(id: number, announcement: unknown): Observable<unknown> {
    return this.api.put(`/instructor/announcements/${id}`, announcement);
  }
}
