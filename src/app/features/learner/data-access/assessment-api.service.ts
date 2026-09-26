import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { MOCK_ASSESSMENTS, MOCK_CERTIFICATES, MOCK_COURSES } from '../../../core/data/mock-data';
import {
  Assessment,
  AssessmentResult,
} from '../../../shared/models/lms.models';

export interface AssessmentRequest {
  assessmentId: number;
  attemptId: number;
  answers: Record<number, string | string[]>;
}

@Injectable({ providedIn: 'root' })
export class AssessmentApiService {
  private readonly api = inject(ApiClientService);

  list(): Observable<Assessment[]> {
    return environment.useMocks ? of(MOCK_ASSESSMENTS) : this.api.get<Assessment[]>('/learner/assessments');
  }
  start(assessmentId: number): Observable<{ attemptId: number; startedAt: string; expiresAt?: string }> {
    if (!environment.useMocks) {
      return this.api.post(`/assessments/${assessmentId}/attempts`, {});
    }
    return of({ attemptId: assessmentId + 700, startedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() });
  }
  submit(assessmentId: number, attemptId: number, answers: Record<number, string | string[]>): Observable<AssessmentResult> {
    if (!environment.useMocks) {
      return this.api.post<AssessmentResult>(`/assessments/${assessmentId}/attempts/${attemptId}/submit`, { answers });
    }
    return of({ attemptId, score: 88, passed: true, completedAt: new Date().toISOString(), message: 'Assessment submitted successfully.' });
  }
  history(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/learner/assessment-attempts');
  }
}
