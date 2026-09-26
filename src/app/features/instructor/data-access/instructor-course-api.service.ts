import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { MOCK_INSTRUCTOR_COURSES } from '../../../core/data/mock-data';
import { Course, CourseDraft } from '../../../shared/models/lms.models';

@Injectable({ providedIn: 'root' })
export class InstructorCourseApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockCourses = [...MOCK_INSTRUCTOR_COURSES];

  listOwned(): Observable<Course[]> {
    return environment.useMocks ? of(this.mockCourses) : this.api.get<Course[]>('/instructor/courses');
  }
  create(course: CourseDraft): Observable<Course> {
    if (!environment.useMocks) {
      return this.api.post<Course>('/instructor/courses', course);
    }
    const created = this.toCourse(course, this.nextId(), 'Draft');
    this.mockCourses.unshift(created);
    return of(created);
  }
  update(id: number, course: Partial<CourseDraft>): Observable<Course> {
    if (!environment.useMocks) {
      return this.api.put<Course>(`/instructor/courses/${id}`, course);
    }
    const index = this.mockCourses.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Course not found');
    this.mockCourses[index] = { ...this.mockCourses[index], ...course } as Course;
    return of(this.mockCourses[index]);
  }
  delete(id: number): Observable<void> {
    if (!environment.useMocks) return this.api.delete<void>(`/instructor/courses/${id}`);
    const index = this.mockCourses.findIndex((item) => item.id === id);
    if (index >= 0) this.mockCourses.splice(index, 1);
    return of(undefined);
  }
  submitForReview(id: number): Observable<Course> {
    if (!environment.useMocks) return this.api.post<Course>(`/instructor/courses/${id}/submit`, {});
    const index = this.mockCourses.findIndex((item) => item.id === id);
    if (index >= 0) this.mockCourses[index] = { ...this.mockCourses[index], status: 'Published' };
    return of(this.mockCourses[index]);
  }
  publish(id: number): Observable<Course> { return this.submitForReview(id); }

  private nextId(): number { return Math.max(...this.mockCourses.map((item) => item.id), 100) + 1; }
  private toCourse(course: CourseDraft, id: number, status: Course['status']): Course {
    return { id, title: course.title, category: course.category, level: course.level, description: course.description, instructor: course.instructor, duration: course.duration, lessons: 0, completedLessons: 0, progress: 0, rating: 0, enrolled: false, icon: 'book', color: 'blue', tags: course.tags, nextLesson: 'Start learning', status };
  }
}

