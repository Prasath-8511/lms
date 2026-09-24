import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { Course } from '../../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class InstructorCourseApiService {
  private readonly api = inject(ApiClientService);
  listOwned(): Observable<Course[]> {
    return environment.useMocks ? of([]) : this.api.get<Course[]>('/instructor/courses');
  }
  create(course: Partial<Course>): Observable<Course> {
    return this.api.post('/instructor/courses', course);
  }
  update(id: number, course: Partial<Course>): Observable<Course> {
    return this.api.put(`/instructor/courses/${id}`, course);
  }
  submitForReview(id: number): Observable<unknown> {
    return this.api.post(`/instructor/courses/${id}/submit`, {});
  }
}
