import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface InstructorAnnouncement {
  id: number;
  title: string;
  courseTitle: string;
  sentAt: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class InstructorAnnouncementApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockAnnouncements: InstructorAnnouncement[] = [
    { id: 1, title: 'New module available', courseTitle: 'Advanced Angular Development', sentAt: 'Sent today', status: 'Published' },
    { id: 2, title: 'Office hours reminder', courseTitle: 'All courses', sentAt: 'Scheduled Sep 28', status: 'Scheduled' },
    { id: 3, title: 'Assessment opens Friday', courseTitle: 'Selenium with Java', sentAt: 'Draft', status: 'Draft' },
  ];
  list(): Observable<InstructorAnnouncement[]> {
    return environment.useMocks ? of([...this.mockAnnouncements]) : this.api.get<InstructorAnnouncement[]>('/instructor/announcements');
  }
  create(announcement: Partial<InstructorAnnouncement>): Observable<unknown> {
    if (environment.useMocks) {
      const created: InstructorAnnouncement = { id: this.mockAnnouncements.length + 1, title: announcement.title ?? 'New announcement', courseTitle: announcement.courseTitle ?? 'All courses', sentAt: 'Draft', status: 'Draft' };
      this.mockAnnouncements.unshift(created);
      return of(created);
    }
    return this.api.post('/instructor/announcements', announcement);
  }
  update(id: number, announcement: unknown): Observable<unknown> {
    return this.api.put(`/instructor/announcements/${id}`, announcement);
  }
}
