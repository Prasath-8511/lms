import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseContentApiService {
  private readonly api = inject(ApiClientService);
  getModules(courseId: number): Observable<unknown> {
    return this.api.get(`/instructor/courses/${courseId}/modules`);
  }
  addModule(courseId: number, module: unknown): Observable<unknown> {
    return this.api.post(`/instructor/courses/${courseId}/modules`, module);
  }
  updateLesson(courseId: number, lessonId: number, lesson: unknown): Observable<unknown> {
    return this.api.put(`/instructor/courses/${courseId}/lessons/${lessonId}`, lesson);
  }
  publish(courseId: number): Observable<unknown> {
    return environment.useMocks
      ? of({ published: true })
      : this.api.post(`/instructor/courses/${courseId}/publish`, {});
  }
}
