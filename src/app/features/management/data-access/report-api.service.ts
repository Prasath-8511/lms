import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagementReportApiService {
  private readonly api = inject(ApiClientService);
  list(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/management/reports');
  }
  generate(payload: unknown): Observable<unknown> {
    return this.api.post('/management/reports', payload);
  }
  download(id: number): Observable<Blob> {
    return this.api.get(`/management/reports/${id}/download`);
  }
}
