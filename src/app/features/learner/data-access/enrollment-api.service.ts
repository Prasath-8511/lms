import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface Enrollment {
  id: number;
  courseId: number;
  progress: number;
  status: string;
}
export interface LearningProgress {
  courseId: number;
  completedLessons: number;
  totalLessons: number;
  lastLesson: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentApiService {
  private readonly api = inject(ApiClientService);
  list(): Observable<Enrollment[]> {
    return environment.useMocks ? of([]) : this.api.get<Enrollment[]>('/learner/enrollments');
  }
  enroll(courseId: number): Observable<Enrollment> {
    return this.api.post(`/courses/${courseId}/enroll`, {});
  }
  optOut(courseId: number): Observable<unknown> {
    return this.api.post(`/learner/enrollments/${courseId}/opt-out`, {});
  }
  getProgress(courseId: number): Observable<LearningProgress> {
    return this.api.get(`/learner/enrollments/${courseId}/progress`);
  }
}
