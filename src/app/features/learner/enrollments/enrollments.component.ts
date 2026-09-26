import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Enrollment, EnrollmentApiService } from '../data-access/enrollment-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-enrollments-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" (itemAction)="optOut($event)" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrollmentsPage {
  private readonly api = inject(EnrollmentApiService);
  protected readonly busyCourseId = signal<number | null>(null);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Learner', title: 'My enrollments', description: 'Manage active course enrollments and keep your learning commitments visible.', icon: 'clipboard', primaryAction: 'Browse catalog', primaryRoute: '/courses', secondaryAction: 'Learning progress', secondaryRoute: '/progress', stats: [], items: [], loading: true, errorMessage: '', emptyMessage: 'You are not enrolled in any courses yet.',
  });

  constructor() { this.load(); }

  private load(): void {
    this.api.list().pipe(finalize(() => this.config.update((config) => ({ ...config, loading: false })))).subscribe({
      next: (enrollments) => this.updateConfig(enrollments),
      error: (error: { error?: { message?: string }; message?: string }) => this.config.update((config) => ({ ...config, errorMessage: error.error?.message ?? error.message ?? 'Unable to load your enrollments.' })),
    });
  }

  protected optOut(item: FeaturePageItem): void {
    if (!item.id || this.busyCourseId() !== null) return;
    this.busyCourseId.set(item.id);
    this.api.optOut(item.id).pipe(finalize(() => this.busyCourseId.set(null))).subscribe({ next: () => this.load(), error: (error: { error?: { message?: string }; message?: string }) => this.config.update((config) => ({ ...config, errorMessage: error.error?.message ?? error.message ?? 'Unable to update this enrollment.' })) });
  }

  private updateConfig(enrollments: Enrollment[]): void {
    const items: FeaturePageItem[] = enrollments.map((enrollment) => ({
      id: enrollment.courseId, title: enrollment.course?.title ?? `Course ${enrollment.courseId}`, subtitle: enrollment.course?.category ?? 'Course enrollment', meta: `${enrollment.progress}% complete`, status: enrollment.status, statusTone: enrollment.status === 'Completed' ? 'green' : enrollment.status === 'Active' ? 'blue' : 'gray', action: enrollment.status === 'Active' ? 'Continue' : 'Review', route: `/courses/${enrollment.courseId}`,
    }));
    this.config.update((config) => ({ ...config, errorMessage: '', items, stats: [{ label: 'Total enrollments', value: String(enrollments.length), change: 'All time', tone: 'blue' }, { label: 'Active', value: String(enrollments.filter((item) => item.status === 'Active').length), change: 'Currently learning', tone: 'green' }, { label: 'Completed', value: String(enrollments.filter((item) => item.status === 'Completed').length), change: 'Great work', tone: 'violet' }, { label: 'Average progress', value: `${enrollments.length ? Math.round(enrollments.reduce((total, item) => total + item.progress, 0) / enrollments.length) : 0}%`, change: 'Across all courses', tone: 'orange' }] }));
  }
}

