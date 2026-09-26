import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { MOCK_CERTIFICATES } from '../../../core/data/mock-data';
import { Certificate } from '../../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class CertificateApiService {
  private readonly api = inject(ApiClientService);
  list(): Observable<Certificate[]> {
    return environment.useMocks ? of(MOCK_CERTIFICATES) : this.api.get<Certificate[]>('/certificates');
  }
  verify(id: string): Observable<unknown> {
    return this.api.get(`/certificates/verify/${id}`);
  }
  download(id: number): Observable<Blob> {
    return this.api.get(`/certificates/${id}/download`);
  }
}
