import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MOCK_ACTIVITY,
  MOCK_ANNOUNCEMENTS,
  MOCK_ASSESSMENTS,
  MOCK_CERTIFICATES,
  MOCK_COURSES,
  MOCK_MODULES,
  MOCK_PROFILE,
  MOCK_STATS,
} from '../data/mock-data';
import {
  ActivityItem,
  Announcement,
  Assessment,
  Certificate,
  Course,
  CourseModule,
  LearningStats,
  LearnerProfile,
} from '../../shared/models/lms.models';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class LmsStoreService {
  private readonly api = inject(ApiClientService);
  private readonly coursesState = signal<Course[]>(MOCK_COURSES);
  private readonly assessmentsState = signal<Assessment[]>(MOCK_ASSESSMENTS);
  private readonly certificatesState = signal<Certificate[]>(MOCK_CERTIFICATES);
  private readonly announcementsState = signal<Announcement[]>(MOCK_ANNOUNCEMENTS);
  private readonly modulesState = signal<Record<number, CourseModule[]>>(MOCK_MODULES);
  private readonly statsState = signal<LearningStats>(MOCK_STATS);
  private readonly profileState = signal<LearnerProfile>(MOCK_PROFILE);

  readonly courses = this.coursesState.asReadonly();
  readonly assessments = this.assessmentsState.asReadonly();
  readonly certificates = this.certificatesState.asReadonly();
  readonly announcements = this.announcementsState.asReadonly();
  readonly modules = this.modulesState.asReadonly();
  readonly stats = this.statsState.asReadonly();
  readonly profile = this.profileState.asReadonly();
  readonly activity = signal<ActivityItem[]>(MOCK_ACTIVITY).asReadonly();
  readonly isLoading = signal(false);
  readonly dataSource = signal<'mock' | 'api'>(environment.useMocks ? 'mock' : 'api');
  readonly enrolledCourses = computed(() => this.courses().filter((course) => course.enrolled));
  readonly inProgressCourses = computed(() =>
    this.courses().filter(
      (course) => course.enrolled && course.progress > 0 && course.progress < 100,
    ),
  );
  readonly unreadAnnouncements = computed(
    () => this.announcements().filter((announcement) => announcement.pinned).length,
  );

  constructor() {
    if (!environment.useMocks) {
      this.loadRemoteData();
    }
  }

  getCourse(id: number): Course | undefined {
    return this.courses().find((course) => course.id === id);
  }

  getModules(id: number): CourseModule[] {
    return this.modules()[id] ?? [];
  }

  enroll(courseId: number): void {
    this.coursesState.update((courses) =>
      courses.map((course) =>
        course.id === courseId
          ? { ...course, enrolled: true, progress: course.progress || 1 }
          : course,
      ),
    );
    this.statsState.update((stats) => ({
      ...stats,
      coursesEnrolled: stats.coursesEnrolled + 1,
      enrolledChange: '+1 just now',
    }));
  }

  completeLesson(courseId: number, lessonId: number): void {
    const courseModules = this.modules()[courseId] ?? [];
    let completedLessons = 0;
    const nextModules = courseModules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => {
        const nextLesson =
          lesson.id === lessonId ? { ...lesson, completed: true, current: false } : lesson;
        if (nextLesson.completed) {
          completedLessons += 1;
        }
        return nextLesson;
      }),
    }));

    this.modulesState.update((modules) => ({ ...modules, [courseId]: nextModules }));
    this.coursesState.update((courses) =>
      courses.map((course) => {
        if (course.id !== courseId) {
          return course;
        }
        const totalLessons = nextModules.reduce(
          (total, module) => total + module.lessons.length,
          0,
        );
        const progress = totalLessons
          ? Math.round((completedLessons / totalLessons) * 100)
          : course.progress;
        return {
          ...course,
          completedLessons,
          progress,
          nextLesson: 'Keep your learning streak alive',
        };
      }),
    );
  }

  private loadRemoteData(): void {
    this.isLoading.set(true);
    this.api
      .get<Course[]>('/courses')
      .pipe(catchError(() => of(MOCK_COURSES)))
      .subscribe((courses) => this.coursesState.set(courses));
    this.api
      .get<Assessment[]>('/assessments')
      .pipe(catchError(() => of(MOCK_ASSESSMENTS)))
      .subscribe((assessments) => this.assessmentsState.set(assessments));
    this.api
      .get<Certificate[]>('/certificates')
      .pipe(catchError(() => of(MOCK_CERTIFICATES)))
      .subscribe((certificates) => this.certificatesState.set(certificates));
    this.api
      .get<Announcement[]>('/announcements')
      .pipe(catchError(() => of(MOCK_ANNOUNCEMENTS)))
      .subscribe((announcements) => this.announcementsState.set(announcements));
    this.api
      .get<LearningStats>('/dashboard/stats')
      .pipe(catchError(() => of(MOCK_STATS)))
      .subscribe((stats) => this.statsState.set(stats));
    this.api
      .get<LearnerProfile>('/profile')
      .pipe(catchError(() => of(MOCK_PROFILE)))
      .subscribe((profile) => this.profileState.set(profile));
    this.isLoading.set(false);
  }
}
