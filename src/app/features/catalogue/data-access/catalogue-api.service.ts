import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

export interface LearnerSearchItem {
  id: number;
  title: string;
  type: string;
  description: string;
  level: string;
}
@Injectable({ providedIn: 'root' })
export class CatalogueApiService {
  private readonly api = inject(ApiClientService);
  search(query: string): Observable<LearnerSearchItem[]> {
    return environment.useMocks
      ? of([])
      : this.api.get<LearnerSearchItem[]>('/catalogue/search', { q: query });
  }
  getCategories(): Observable<unknown[]> {
    return environment.useMocks ? of([]) : this.api.get<unknown[]>('/catalogue/categories');
  }
  getFeatured(): Observable<LearnerSearchItem[]> {
    return environment.useMocks ? of([]) : this.api.get<LearnerSearchItem[]>('/catalogue/featured');
  }
}
