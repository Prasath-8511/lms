import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { EnrollmentApiService } from '../data-access/enrollment-api.service';
import { CourseCatalogApiService } from '../../catalogue/data-access/course-catalog-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { CourseModule } from '../../../shared/models/lms.models';

@Component({
  selector: 'app-player-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPage {
  private readonly enrollments = inject(EnrollmentApiService);
  private readonly catalog = inject(CourseCatalogApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Learning player',
    title: 'Continue where you left off',
    description: 'Pick up a lesson, revisit a concept, and keep your learning streak active.',
    icon: 'play',
    primaryAction: 'Resume lesson',
    secondaryAction: 'View curriculum',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'You have no active lessons to continue.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.enrollments
      .list()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (enrollments) => {
          const active = enrollments.find((enrollment) => enrollment.status !== 'Completed') ?? enrollments[0];
          if (!active) {
            this.patch({ items: [], stats: [] });
            return;
          }
          this.loadLessons(active.courseId, active.progress);
        },
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load your lessons.' }),
      });
  }

  private loadLessons(courseId: number, progress: number): void {
    this.catalog
      .getOutline(courseId)
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (modules) => this.apply(modules, courseId, progress),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load the course outline.' }),
      });
  }

  private apply(modules: CourseModule[], courseId: number, progress: number): void {
    const lessons: FeaturePageItem[] = modules.flatMap((module, moduleIndex) =>
      module.lessons.map((lesson, lessonIndex): FeaturePageItem => {
        const statusTone: FeaturePageItem['statusTone'] = lesson.completed
          ? 'green'
          : lesson.current
            ? 'blue'
            : 'gray';
        return {
          id: lesson.id,
          title: lesson.title,
          subtitle: `Module ${moduleIndex + 1} · Lesson ${lessonIndex + 1}`,
          meta: lesson.duration,
          status: lesson.completed ? 'Completed' : lesson.current ? 'Current' : 'Not started',
          statusTone,
          action: lesson.completed ? 'Review' : 'Resume',
          route: `/courses/${courseId}`,
        };
      }),
    );
    const total = lessons.length;
    const completed = lessons.filter((lesson) => lesson.status === 'Completed').length;
    this.patch({
      errorMessage: '',
      items: lessons,
      stats: [
        { label: 'Lessons completed', value: `${completed}/${total}`, change: 'In this course', tone: 'blue' },
        { label: 'Progress', value: `${progress}%`, change: 'Course completion', tone: 'green' },
        { label: 'Modules', value: String(modules.length), change: 'Course structure', tone: 'violet' },
        { label: 'Next lesson', value: lessons.find((lesson) => lesson.status === 'Current')?.title ?? '—', change: 'Keep it going', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
