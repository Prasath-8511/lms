import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { Assessment } from '../../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class AssessmentApiService {
  private readonly api = inject(ApiClientService);
  list(): Observable<Assessment[]> {
    return environment.useMocks ? of([]) : this.api.get<Assessment[]>('/learner/assessments');
  }
  start(assessmentId: number): Observable<unknown> {
    return this.api.post(`/assessments/${assessmentId}/attempts`, {});
  }
  submit(assessmentId: number, attemptId: number, answers: unknown): Observable<unknown> {
    return this.api.post(`/assessments/${assessmentId}/attempts/${attemptId}/submit`, { answers });
  }
  history(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/learner/assessment-attempts');
  }
}
