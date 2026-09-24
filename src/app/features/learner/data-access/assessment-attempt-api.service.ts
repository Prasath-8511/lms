import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { Assessment } from '../../../shared/models/lms.models';

export interface AssessmentAttempt {
  id: number;
  assessmentId: number;
  status: 'Not started' | 'In progress' | 'Submitted' | 'Graded';
  score?: number;
  startedAt: string;
  submittedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentAttemptApiService {
  private readonly api = inject(ApiClientService);

  list(): Observable<AssessmentAttempt[]> {
    return environment.useMocks
      ? of([])
      : this.api.get<AssessmentAttempt[]>('/learner/assessment-attempts');
  }

  start(assessmentId: number): Observable<unknown> {
    return this.api.post(`/assessments/${assessmentId}/attempts`, {});
  }

  saveAnswer(attemptId: number, questionId: number, answer: unknown): Observable<unknown> {
    return this.api.put(`/learner/assessment-attempts/${attemptId}/answers/${questionId}`, {
      answer,
    });
  }

  submit(attemptId: number, answers: unknown): Observable<unknown> {
    return this.api.post(`/learner/assessment-attempts/${attemptId}/submit`, { answers });
  }

  get(attemptId: number): Observable<AssessmentAttempt> {
    return this.api.get(`/learner/assessment-attempts/${attemptId}`);
  }

  getAssessment(assessmentId: number): Observable<Assessment> {
    return this.api.get(`/assessments/${assessmentId}`);
  }
}
