import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GradingApiService {
  private readonly api = inject(ApiClientService);
  queue(courseId: number): Observable<unknown[]> {
    return environment.useMocks
      ? of([])
      : this.api.get<unknown[]>(`/instructor/courses/${courseId}/grading`);
  }
  submit(assignmentId: number, payload: unknown): Observable<unknown> {
    return this.api.post(`/instructor/assignments/${assignmentId}/grade`, payload);
  }
  publishGrades(courseId: number): Observable<unknown> {
    return this.api.post(`/instructor/courses/${courseId}/grades/publish`, {});
  }
}
