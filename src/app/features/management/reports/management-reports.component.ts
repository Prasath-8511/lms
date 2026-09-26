import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ManagementReport, ManagementReportApiService } from '../data-access/report-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-management-reports-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" (primaryAction)="generate()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementReportsPage {
  private readonly api = inject(ManagementReportApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Management',
    title: 'Management reports',
    description: 'Turn learning data into clear decisions for teams and leadership.',
    icon: 'chart',
    primaryAction: 'Generate report',
    secondaryAction: 'Back to dashboard',
    secondaryRoute: '/management/overview',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No reports have been generated yet.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .list()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (reports) => this.apply(reports),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load reports.' }),
      });
  }

  protected generate(): void {
    if (this.config().loading) {
      return;
    }
    this.patch({ loading: true, errorMessage: '' });
    this.api
      .generate({})
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: () => this.load(),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to generate a report.' }),
      });
  }

  private apply(reports: ManagementReport[]): void {
    const items: FeaturePageItem[] = reports.map((report) => ({
      id: report.id,
      title: report.name,
      subtitle: report.period,
      meta: report.status,
      status: report.status,
      statusTone: report.status === 'Ready' ? 'green' : 'blue',
      action: 'View report',
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Reports generated', value: String(reports.length), change: 'All time', tone: 'blue' },
        { label: 'Ready to share', value: String(reports.filter((report) => report.status === 'Ready').length), change: 'Available now', tone: 'green' },
        { label: 'Scheduled', value: String(reports.filter((report) => report.status === 'Scheduled').length), change: 'Upcoming', tone: 'violet' },
        { label: 'Periods covered', value: String(new Set(reports.map((report) => report.period)).size), change: 'Distinct ranges', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
