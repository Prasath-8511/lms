import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface CourseReview {
  id: number;
  courseId: number;
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
}
@Injectable({ providedIn: 'root' })
export class CourseReviewApiService {
  private readonly api = inject(ApiClientService);
  queue(): Observable<CourseReview[]> {
    return environment.useMocks
      ? of([])
      : this.api.get<CourseReview[]>('/management/course-reviews');
  }
  decide(
    reviewId: number,
    decision: 'approved' | 'changes_requested',
    reason?: string,
  ): Observable<unknown> {
    return this.api.post(`/management/course-reviews/${reviewId}/decision`, { decision, reason });
  }
  requestChanges(reviewId: number, reason: string): Observable<unknown> {
    return this.decide(reviewId, 'changes_requested', reason);
  }
}
