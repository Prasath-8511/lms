import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface ManagedAnnouncement {
  id: number;
  title: string;
  audience: string;
  publishedAt: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ManagementAnnouncementApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockAnnouncements: ManagedAnnouncement[] = [
    { id: 1, title: 'Q3 learning impact is ready', audience: 'Organization-wide', publishedAt: 'Today', status: 'Published' },
    { id: 2, title: 'Security awareness deadline', audience: 'Compliance', publishedAt: 'Scheduled Oct 01', status: 'Scheduled' },
    { id: 3, title: 'New manager essentials', audience: 'Management program', publishedAt: 'Draft', status: 'Draft' },
  ];
  list(): Observable<ManagedAnnouncement[]> {
    return environment.useMocks ? of([...this.mockAnnouncements]) : this.api.get<ManagedAnnouncement[]>('/management/announcements');
  }
  create(announcement: Partial<ManagedAnnouncement>): Observable<unknown> {
    if (environment.useMocks) {
      const created: ManagedAnnouncement = { id: this.mockAnnouncements.length + 1, title: announcement.title ?? 'New announcement', audience: announcement.audience ?? 'Organization-wide', publishedAt: 'Draft', status: 'Draft' };
      this.mockAnnouncements.unshift(created);
      return of(created);
    }
    return this.api.post('/management/announcements', announcement);
  }
  update(id: number, announcement: unknown): Observable<unknown> {
    return this.api.put(`/management/announcements/${id}`, announcement);
  }
  publish(id: number): Observable<unknown> {
    return this.api.post(`/management/announcements/${id}/publish`, {});
  }
}
