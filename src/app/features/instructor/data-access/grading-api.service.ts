import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface GradingItem {
  id: number;
  assignmentTitle: string;
  learnerName: string;
  submittedAt: string;
  status: string;
  score?: number;
}

@Injectable({ providedIn: 'root' })
export class GradingApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockQueue: GradingItem[] = [
    { id: 1, assignmentTitle: 'TestNG framework checkpoint', learnerName: 'Ravi Patel', submittedAt: 'Submitted today', status: 'To grade' },
    { id: 2, assignmentTitle: 'Module reflection', learnerName: 'Alex Johnson', submittedAt: 'Submitted yesterday', status: 'To grade' },
    { id: 3, assignmentTitle: 'End-to-end test review', learnerName: 'Sofia Garcia', submittedAt: 'Sep 21', status: 'Graded', score: 94 },
  ];
  queue(courseId: number): Observable<GradingItem[]> {
    return environment.useMocks
      ? of([...this.mockQueue])
      : this.api.get<GradingItem[]>(`/instructor/courses/${courseId}/grading`);
  }
  submit(assignmentId: number, payload: unknown): Observable<unknown> {
    if (environment.useMocks) {
      const index = this.mockQueue.findIndex((item) => item.id === assignmentId);
      if (index >= 0) {
        const score = Number((payload as { score?: number })?.score ?? 0);
        this.mockQueue[index] = { ...this.mockQueue[index], status: 'Graded', score };
        return of(this.mockQueue[index]);
      }
      return of({ assignmentId, ...(payload as object) });
    }
    return this.api.post(`/instructor/assignments/${assignmentId}/grade`, payload);
  }
  publishGrades(courseId: number): Observable<unknown> {
    return this.api.post(`/instructor/courses/${courseId}/grades/publish`, {});
  }
}
