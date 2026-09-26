import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, forkJoin, of, tap } from 'rxjs';
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
  private readonly coursesState = signal<Course[]>(environment.useMocks ? MOCK_COURSES : []);
  private readonly assessmentsState = signal<Assessment[]>(environment.useMocks ? MOCK_ASSESSMENTS : []);
  private readonly certificatesState = signal<Certificate[]>(environment.useMocks ? MOCK_CERTIFICATES : []);
  private readonly announcementsState = signal<Announcement[]>(environment.useMocks ? MOCK_ANNOUNCEMENTS : []);
  private readonly modulesState = signal<Record<number, CourseModule[]>>(environment.useMocks ? MOCK_MODULES : {});
  private readonly statsState = signal<LearningStats>(
    environment.useMocks
      ? MOCK_STATS
      : {
          coursesEnrolled: 0,
          coursesCompleted: 0,
          certificationsEarned: 0,
          learningHours: 0,
          enrolledChange: 'No data yet',
          completedChange: 'No data yet',
          certificationChange: 'No data yet',
          hoursChange: 'No data yet',
        },
  );
  private readonly profileState = signal<LearnerProfile>(
    environment.useMocks
      ? MOCK_PROFILE
      : { name: '', role: '', email: '', initials: '', streak: 0, totalHours: 0, completedCourses: 0, certificates: 0 },
  );

  readonly courses = this.coursesState.asReadonly();
  readonly assessments = this.assessmentsState.asReadonly();
  readonly certificates = this.certificatesState.asReadonly();
  readonly announcements = this.announcementsState.asReadonly();
  readonly modules = this.modulesState.asReadonly();
  readonly stats = this.statsState.asReadonly();
  readonly profile = this.profileState.asReadonly();
  readonly activity = signal<ActivityItem[]>(environment.useMocks ? MOCK_ACTIVITY : []).asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly lastLoadedAt = signal<Date | null>(null);
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

  enroll(courseId: number): Observable<Course> {
    if (environment.useMocks) {
      return of(this.toEnrolledCourse(courseId));
    }
    return this.api.post<Course>(`/courses/${courseId}/enroll`, {}).pipe(
      tap((course) => this.replaceCourse(course)),
    );
  }

  completeLesson(courseId: number, lessonId: number): Observable<Course> {
    if (environment.useMocks) {
      return of(this.completeLessonLocally(courseId, lessonId));
    }
    return this.api
      .post<Course>(
        `/learner/enrollments/${courseId}/lessons/${lessonId}/complete`,
        {},
      )
      .pipe(tap((course) => this.replaceCourse(course)));
  }

  private replaceCourse(course: Course): void {
    this.coursesState.update((courses) => {
      const exists = courses.some((item) => item.id === course.id);
      return exists ? courses.map((item) => (item.id === course.id ? course : item)) : [course, ...courses];
    });
  }

  private applyCompletedLesson(courseId: number, lessonId: number): void {
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
        return {
          ...course,
          completedLessons,
          progress: totalLessons
            ? Math.round((completedLessons / totalLessons) * 100)
            : course.progress,
          nextLesson: 'Keep your learning streak alive',
        };
      }),
    );
  }

  private completeLessonLocally(courseId: number, lessonId: number): Course {
    this.applyCompletedLesson(courseId, lessonId);
    return this.getCourse(courseId) ?? this.courses()[0];
  }

  private toEnrolledCourse(courseId: number): Course {
    const course = this.getCourse(courseId);
    if (!course) {
      throw new Error(`Course ${courseId} was not found`);
    }
    this.coursesState.update((courses) =>
      courses.map((item) =>
        item.id === courseId ? { ...item, enrolled: true, progress: item.progress || 1 } : item,
      ),
    );
    return this.getCourse(courseId) as Course;
  }

  private loadRemoteData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      courses: this.api.get<Course[]>('/courses'),
      assessments: this.api.get<Assessment[]>('/assessments'),
      certificates: this.api.get<Certificate[]>('/certificates'),
      announcements: this.api.get<Announcement[]>('/announcements'),
      stats: this.api.get<LearningStats>('/dashboard/stats'),
      profile: this.api.get<LearnerProfile>('/profile'),
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.coursesState.set(data.courses);
          this.assessmentsState.set(data.assessments);
          this.certificatesState.set(data.certificates);
          this.announcementsState.set(data.announcements);
          this.statsState.set(data.stats);
          this.profileState.set(data.profile);
          this.lastLoadedAt.set(new Date());
        },
        error: (error: { error?: { message?: string }; message?: string }) => {
          this.errorMessage.set(
            error.error?.message ?? error.message ?? 'Unable to load learning data. Please try again.',
          );
        },
      });
  }
}
