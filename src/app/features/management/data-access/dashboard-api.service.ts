import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface ManagementSummary {
  activeLearners: number;
  completionRate: number;
  learningHours: number;
  certificates: number;
}

@Injectable({ providedIn: 'root' })
export class ManagementDashboardApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockSummary: ManagementSummary = { activeLearners: 1842, completionRate: 74, learningHours: 6420, certificates: 486 };
  private readonly mockPrograms = [
    { id: 1, name: 'Frontend Engineering Path', type: 'Learning path', learners: 642, progress: 78, status: 'On track' },
    { id: 2, name: 'Quality Engineering Path', type: 'Learning path', learners: 418, progress: 71, status: 'On track' },
    { id: 3, name: 'Security awareness 2026', type: 'Compliance', learners: 568, progress: 89, status: 'On track' },
  ];
  getSummary(): Observable<ManagementSummary> {
    return environment.useMocks
      ? of({ ...this.mockSummary })
      : this.api.get<ManagementSummary>('/management/dashboard');
  }
  getTrend(period = 'month'): Observable<unknown[]> {
    return environment.useMocks
      ? of([])
      : this.api.get<unknown[]>('/management/dashboard/trend', { period });
  }
  getPrograms(): Observable<ManagementProgram[]> {
    return environment.useMocks
      ? of([...this.mockPrograms])
      : this.api.get<ManagementProgram[]>('/management/programs');
  }
}

export interface ManagementProgram {
  id: number;
  name: string;
  type: string;
  learners: number;
  progress: number;
  status: string;
}
