import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagementDashboardApiService {
  private readonly api = inject(ApiClientService);
  getSummary(): Observable<unknown> {
    return environment.useMocks
      ? of({ activeLearners: 1842, completionRate: 74, learningHours: 6420, certificates: 486 })
      : this.api.get('/management/dashboard');
  }
  getTrend(period = 'month'): Observable<unknown[]> {
    return environment.useMocks
      ? of([])
      : this.api.get<unknown[]>('/management/dashboard/trend', { period });
  }
}
