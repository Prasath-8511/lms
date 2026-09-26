import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Enrollment, EnrollmentApiService } from '../data-access/enrollment-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-learning-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPage {
  private readonly api = inject(EnrollmentApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Learner',
    title: 'Your learning journey',
    description: 'See your active enrollments, deadlines, and next learning actions.',
    icon: 'play',
    primaryAction: 'Find a course',
    primaryRoute: '/courses',
    secondaryAction: 'View certificates',
    secondaryRoute: '/certifications',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'You are not enrolled in any courses yet.',
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
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load your learning journey.' }),
      });
  }

  private apply(enrollments: Enrollment[]): void {
    const items: FeaturePageItem[] = enrollments.map((enrollment) => ({
      id: enrollment.courseId,
      title: enrollment.course?.title ?? `Course ${enrollment.courseId}`,
      subtitle: enrollment.course?.nextLesson ?? 'Course progress',
      meta: `${enrollment.progress}%`,
      status: enrollment.status,
      statusTone: enrollment.status === 'Completed' ? 'green' : 'blue',
      action: enrollment.status === 'Completed' ? 'Review' : 'Continue',
      route: `/courses/${enrollment.courseId}`,
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Active courses', value: String(enrollments.filter((item) => item.status !== 'Completed').length), change: 'Currently learning', tone: 'blue' },
        { label: 'Completed', value: String(enrollments.filter((item) => item.status === 'Completed').length), change: 'Finished courses', tone: 'green' },
        { label: 'Average progress', value: `${enrollments.length ? Math.round(enrollments.reduce((total, item) => total + item.progress, 0) / enrollments.length) : 0}%`, change: 'Across enrollments', tone: 'violet' },
        { label: 'Next lesson', value: enrollments[0]?.course?.nextLesson ?? '—', change: 'Keep it going', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
