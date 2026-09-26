import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Enrollment, EnrollmentApiService } from '../data-access/enrollment-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPage {
  private readonly api = inject(EnrollmentApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Learner',
    title: 'Learning progress',
    description: 'Track completion, learning hours, and the milestones you are building toward.',
    icon: 'trend',
    primaryAction: 'View learning',
    primaryRoute: '/my-learning',
    secondaryAction: 'Learning progress',
    secondaryRoute: '/progress',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No learning progress is available yet.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .list()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (enrollments) => this.apply(enrollments),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load your progress.' }),
      });
  }

  private apply(enrollments: Enrollment[]): void {
    const items: FeaturePageItem[] = enrollments.map((enrollment) => ({
      id: enrollment.courseId,
      title: enrollment.course?.title ?? `Course ${enrollment.courseId}`,
      subtitle: `${enrollment.course?.completedLessons ?? 0} of ${enrollment.course?.lessons ?? 0} lessons`,
      meta: `${enrollment.progress}%`,
      status: enrollment.status,
      statusTone: enrollment.progress >= 70 ? 'green' : enrollment.progress >= 40 ? 'blue' : 'orange',
      action: 'View details',
      route: `/courses/${enrollment.courseId}`,
    }));
    const average = enrollments.length
      ? Math.round(enrollments.reduce((total, enrollment) => total + enrollment.progress, 0) / enrollments.length)
      : 0;
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Overall progress', value: `${average}%`, change: 'Across all courses', tone: 'blue' },
        { label: 'Lessons completed', value: String(enrollments.reduce((total, enrollment) => total + (enrollment.course?.completedLessons ?? 0), 0)), change: 'Total finished', tone: 'green' },
        { label: 'Active courses', value: String(enrollments.filter((enrollment) => enrollment.status !== 'Completed').length), change: 'Currently learning', tone: 'violet' },
        { label: 'Completed', value: String(enrollments.filter((enrollment) => enrollment.status === 'Completed').length), change: 'Finished courses', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
