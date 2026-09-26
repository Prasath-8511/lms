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
  selector: 'app-management-dashboard-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementDashboardPage {
  private readonly api = inject(ManagementDashboardApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Management',
    title: 'Learning health dashboard',
    description: 'Monitor participation, progress, and impact across the organization.',
    icon: 'chart',
    primaryAction: 'View learning health',
    secondaryAction: 'Generate report',
    secondaryRoute: '/management/reports',
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
          this.patch({ errorMessage: this.message(error, 'Unable to load the dashboard.') }),
      });
  }

  private loadPrograms(summary: ManagementSummary): void {
    this.api
      .getPrograms()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (programs) => this.apply(summary, programs),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: this.message(error, 'Unable to load programs.') }),
      });
  }

  private apply(summary: ManagementSummary, programs: ManagementProgram[]): void {
    const items: FeaturePageItem[] = programs.map((program) => ({
      id: program.id,
      title: program.name,
      subtitle: program.type,
      meta: `${program.progress}% complete`,
      status: program.status,
      statusTone: 'green',
      action: 'View program',
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Active learners', value: summary.activeLearners.toLocaleString(), change: 'Across all programs', tone: 'blue' },
        { label: 'Completion rate', value: `${summary.completionRate}%`, change: 'Organization wide', tone: 'green' },
        { label: 'Learning hours', value: summary.learningHours.toLocaleString(), change: 'Total logged', tone: 'violet' },
        { label: 'Certificates', value: summary.certificates.toLocaleString(), change: 'Issued to date', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }

  private message(error: { error?: { message?: string }; message?: string }, fallback: string): string {
    return error.error?.message ?? error.message ?? fallback;
  }
}
