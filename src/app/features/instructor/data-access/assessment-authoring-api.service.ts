import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssessmentAuthoringApiService {
  private readonly api = inject(ApiClientService);
  list(courseId: number): Observable<unknown[]> {
    return environment.useMocks
      ? of([])
      : this.api.get<unknown[]>(`/instructor/courses/${courseId}/assessments`);
  }
  create(courseId: number, assessment: unknown): Observable<unknown> {
    return this.api.post(`/instructor/courses/${courseId}/assessments`, assessment);
  }
  update(assessmentId: number, assessment: unknown): Observable<unknown> {
    return this.api.put(`/instructor/assessments/${assessmentId}`, assessment);
  }
  remove(assessmentId: number): Observable<unknown> {
    return this.api.post(`/instructor/assessments/${assessmentId}/delete`, {});
  }
}
