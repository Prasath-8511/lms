import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { MOCK_MODULES } from '../../../core/data/mock-data';
import {
  CourseModule,
  CourseModuleDraft,
  Lesson,
  LessonDraft,
} from '../../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class CourseContentApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockModules = new Map<number, CourseModule[]>(
    Object.entries(MOCK_MODULES).map(([id, modules]) => [Number(id), structuredClone(modules)]),
  );

  getModules(courseId: number): Observable<CourseModule[]> {
    return environment.useMocks ? of(this.mockModules.get(courseId) ?? []) : this.api.get<CourseModule[]>(`/instructor/courses/${courseId}/modules`);
  }
  addModule(courseId: number, module: CourseModuleDraft): Observable<CourseModule> {
    if (!environment.useMocks) return this.api.post<CourseModule>(`/instructor/courses/${courseId}/modules`, module);
    const modules = this.mockModules.get(courseId) ?? [];
    const created = { id: Date.now(), title: module.title, lessons: [] } satisfies CourseModule;
    modules.push(created);
    this.mockModules.set(courseId, modules);
    return of(created);
  }
  updateModule(courseId: number, moduleId: number, module: Partial<CourseModuleDraft>): Observable<CourseModule> {
    if (!environment.useMocks) return this.api.put<CourseModule>(`/instructor/courses/${courseId}/modules/${moduleId}`, module);
    const modules = this.mockModules.get(courseId) ?? [];
    const index = modules.findIndex((item) => item.id === moduleId);
    if (index < 0) throw new Error('Module not found');
    modules[index] = { ...modules[index], ...module };
    return of(modules[index]);
  }
  deleteModule(courseId: number, moduleId: number): Observable<void> {
    if (!environment.useMocks) return this.api.delete<void>(`/instructor/courses/${courseId}/modules/${moduleId}`);
    const modules = (this.mockModules.get(courseId) ?? []).filter((item) => item.id !== moduleId);
    this.mockModules.set(courseId, modules);
    return of(undefined);
  }
  addLesson(courseId: number, moduleId: number, lesson: LessonDraft): Observable<Lesson> {
    if (!environment.useMocks) return this.api.post<Lesson>(`/instructor/courses/${courseId}/modules/${moduleId}/lessons`, lesson);
    const module = (this.mockModules.get(courseId) ?? []).find((item) => item.id === moduleId);
    if (!module) throw new Error('Module not found');
    const created: Lesson = { id: Date.now(), title: lesson.title, type: lesson.type, duration: lesson.duration, completed: false };
    module.lessons.push(created);
    return of(created);
  }
  updateLesson(courseId: number, lessonId: number, lesson: Partial<LessonDraft>): Observable<Lesson> {
    if (!environment.useMocks) return this.api.put<Lesson>(`/instructor/courses/${courseId}/lessons/${lessonId}`, lesson);
    const modules = this.mockModules.get(courseId) ?? [];
    for (const module of modules) {
      const index = module.lessons.findIndex((item) => item.id === lessonId);
      if (index >= 0) {
        module.lessons[index] = { ...module.lessons[index], ...lesson };
        return of(module.lessons[index]);
      }
    }
    throw new Error('Lesson not found');
  }
  deleteLesson(courseId: number, lessonId: number): Observable<void> {
    if (!environment.useMocks) return this.api.delete<void>(`/instructor/courses/${courseId}/lessons/${lessonId}`);
    const modules = this.mockModules.get(courseId) ?? [];
    for (const module of modules) module.lessons = module.lessons.filter((item) => item.id !== lessonId);
    this.mockModules.set(courseId, modules);
    return of(undefined);
  }
  reorderModules(courseId: number, moduleIds: number[]): Observable<CourseModule[]> {
    if (!environment.useMocks) return this.api.put<CourseModule[]>(`/instructor/courses/${courseId}/modules/reorder`, { moduleIds });
    const modules = this.mockModules.get(courseId) ?? [];
    const reordered = moduleIds.map((id) => modules.find((item) => item.id === id)).filter((item): item is CourseModule => !!item);
    this.mockModules.set(courseId, reordered);
    return of(reordered);
  }
  publish(courseId: number): Observable<void> {
    return environment.useMocks ? of(undefined) : this.api.post<void>(`/instructor/courses/${courseId}/publish`, {});
  }
}
