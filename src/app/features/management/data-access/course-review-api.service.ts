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
  private readonly mockReviews: CourseReview[] = [
    { id: 1, courseId: 104, title: 'API Design Fundamentals', submittedBy: 'Priya Nair', submittedAt: 'Today', status: 'Awaiting review' },
    { id: 2, courseId: 103, title: 'Playwright Automation Testing', submittedBy: 'Maya Thompson', submittedAt: 'Yesterday', status: 'Awaiting review' },
    { id: 3, courseId: 102, title: 'Selenium with Java', submittedBy: 'Daniel Carter', submittedAt: 'Sep 21', status: 'Approved' },
  ];

  queue(): Observable<CourseReview[]> {
    return environment.useMocks
      ? of([...this.mockReviews])
      : this.api.get<CourseReview[]>('/management/course-reviews');
  }
  decide(
    reviewId: number,
    decision: 'approved' | 'changes_requested',
    reason?: string,
  ): Observable<unknown> {
    if (environment.useMocks) {
      const index = this.mockReviews.findIndex((review) => review.id === reviewId);
      if (index >= 0) {
        this.mockReviews[index] = { ...this.mockReviews[index], status: decision === 'approved' ? 'Approved' : 'Changes requested' };
        return of(this.mockReviews[index]);
      }
      return of({ reviewId, decision, reason });
    }
    return this.api.post(`/management/course-reviews/${reviewId}/decision`, { decision, reason });
  }
  requestChanges(reviewId: number, reason: string): Observable<unknown> {
    return this.decide(reviewId, 'changes_requested', reason);
  }
}
