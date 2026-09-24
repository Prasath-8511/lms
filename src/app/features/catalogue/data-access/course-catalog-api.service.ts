import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { Course } from '../../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class CourseCatalogApiService {
  private readonly api = inject(ApiClientService);
  listPublished(params?: Record<string, string>): Observable<Course[]> {
    return environment.useMocks ? of([]) : this.api.get<Course[]>('/courses', params);
  }
  getCourse(id: number): Observable<Course> {
    return this.api.get<Course>(`/courses/${id}`);
  }
  getOutline(id: number): Observable<unknown> {
    return this.api.get(`/courses/${id}/outline`);
  }
  getRecommendations(): Observable<Course[]> {
    return environment.useMocks ? of([]) : this.api.get<Course[]>('/courses/recommended');
  }
}
