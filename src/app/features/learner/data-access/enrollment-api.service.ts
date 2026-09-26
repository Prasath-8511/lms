import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

import { MOCK_COURSES } from '../../../core/data/mock-data';
import { Course } from '../../../shared/models/lms.models';

export interface Enrollment {
  id: number;
  courseId: number;
  course?: Course;
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
    if (!environment.useMocks) {
      return this.api.get<Enrollment[]>('/learner/enrollments');
    }
    return of(
      MOCK_COURSES.filter((course) => course.enrolled).map((course, index) => ({
        id: course.id,
        courseId: course.id,
        course,
        progress: course.progress,
        status: course.progress === 100 ? 'Completed' : 'Active',
      })),
    );
  }
  enroll(courseId: number): Observable<Enrollment> {
    if (!environment.useMocks) {
      return this.api.post<Enrollment>(`/courses/${courseId}/enroll`, {});
    }
    const course = MOCK_COURSES.find((item) => item.id === courseId);
    return of({ id: courseId, courseId, course, progress: course?.progress ?? 0, status: 'Active' });
  }
  optOut(courseId: number): Observable<unknown> {
    return this.api.post(`/learner/enrollments/${courseId}/opt-out`, {});
  }
  getProgress(courseId: number): Observable<LearningProgress> {
    return this.api.get(`/learner/enrollments/${courseId}/progress`);
  }
}
