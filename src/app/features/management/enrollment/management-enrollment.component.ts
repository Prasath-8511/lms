import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  ManagementDashboardApiService,
  ManagementProgram,
  ManagementSummary,
} from '../data-access/dashboard-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-management-enrollment-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementEnrollmentPage {
  private readonly api = inject(ManagementDashboardApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Management',
    title: 'Enrollment management',
    description: 'Monitor enrollment activity and help learners find the right programs.',
    icon: 'users',
    primaryAction: 'Open learner report',
    secondaryAction: 'Learning dashboard',
    secondaryRoute: '/management/dashboard',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No programs are available yet.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .getSummary()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (summary) => this.loadPrograms(summary),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load enrollments.' }),
      });
  }

  private loadPrograms(summary: ManagementSummary): void {
    this.api
      .getPrograms()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (programs) => this.apply(summary, programs),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load programs.' }),
      });
  }

  private apply(summary: ManagementSummary, programs: ManagementProgram[]): void {
    const items: FeaturePageItem[] = programs.map((program) => ({
      id: program.id,
      title: program.name,
      subtitle: program.type,
      meta: `${program.learners} learners`,
      status: program.status,
      statusTone: 'green',
      action: 'View enrollments',
    }));
    const totalLearners = programs.reduce((total, program) => total + program.learners, 0);
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Total enrollments', value: totalLearners.toLocaleString(), change: 'Across programs', tone: 'blue' },
        { label: 'Active learners', value: summary.activeLearners.toLocaleString(), change: 'Currently learning', tone: 'green' },
        { label: 'Programs', value: String(programs.length), change: 'Available to enroll', tone: 'violet' },
        { label: 'Completion rate', value: `${summary.completionRate}%`, change: 'Organization wide', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
