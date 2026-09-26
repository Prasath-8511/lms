import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface ManagementReport {
  id: number;
  name: string;
  period: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ManagementReportApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockReports: ManagementReport[] = [
    { id: 1, name: 'Q3 learning impact report', period: 'Quarterly', status: 'Ready' },
    { id: 2, name: 'Team participation overview', period: 'Monthly', status: 'Scheduled' },
    { id: 3, name: 'Compliance completion', period: 'Monthly', status: 'Ready' },
  ];
  list(): Observable<ManagementReport[]> {
    return environment.useMocks ? of([...this.mockReports]) : this.api.get<ManagementReport[]>('/management/reports');
  }
  generate(payload: unknown): Observable<unknown> {
    if (environment.useMocks) {
      const created: ManagementReport = { id: this.mockReports.length + 1, name: 'Generated report', period: 'Custom', status: 'Ready' };
      this.mockReports.unshift(created);
      return of(created);
    }
    return this.api.post('/management/reports', payload);
  }
  download(id: number): Observable<Blob> {
    return this.api.get(`/management/reports/${id}/download`);
  }
}
