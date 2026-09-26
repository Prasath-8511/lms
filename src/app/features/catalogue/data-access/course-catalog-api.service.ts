import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { MOCK_COURSES, MOCK_MODULES } from '../../../core/data/mock-data';
import { Course, CourseModule } from '../../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class CourseCatalogApiService {
  private readonly api = inject(ApiClientService);
  listPublished(params?: Record<string, string>): Observable<Course[]> {
    if (!environment.useMocks) {
      return this.api.get<Course[]>('/courses', params);
    }
    const query = params?.['q']?.trim().toLowerCase();
    return of(
      MOCK_COURSES.filter((course) =>
        !query
          ? course.status === 'Published'
          : [course.title, course.description, course.category, ...course.tags]
              .join(' ')
              .toLowerCase()
              .includes(query),
      ),
    );
  }
  getCourse(id: number): Observable<Course> {
    if (environment.useMocks) {
      const course = MOCK_COURSES.find((item) => item.id === id);
      return course ? of(course) : this.api.get<Course>(`/courses/${id}`);
    }
    return this.api.get<Course>(`/courses/${id}`);
  }
  getOutline(id: number): Observable<CourseModule[]> {
    return environment.useMocks ? of(MOCK_MODULES[id] ?? []) : this.api.get<CourseModule[]>(`/courses/${id}/outline`);
  }
  getRecommendations(): Observable<Course[]> {
    return environment.useMocks ? of(MOCK_COURSES.slice(3)) : this.api.get<Course[]>('/courses/recommended');
  }
}
