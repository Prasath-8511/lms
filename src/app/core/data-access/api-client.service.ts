import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });

    return this.http
      .get<T | ApiEnvelope<T>>(`${this.baseUrl}${path}`, { params: httpParams })
      .pipe(map((payload) => this.unwrap(payload)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T | ApiEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((payload) => this.unwrap(payload)));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<T | ApiEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((payload) => this.unwrap(payload)));
  }

  setRuntimeApiKey(apiKey: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(environment.apiKeyStorageKey, apiKey);
    }
  }

  clearRuntimeApiKey(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(environment.apiKeyStorageKey);
    }
  }

  private unwrap<T>(payload: T | ApiEnvelope<T>): T {
    if (typeof payload === 'object' && payload !== null && 'data' in payload) {
      return (payload as ApiEnvelope<T>).data;
    }
    return payload as T;
  }
}
