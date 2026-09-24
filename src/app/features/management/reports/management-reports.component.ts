import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ManagementReportApiService } from '../data-access/report-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-management-reports-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementReportsPage {
  private readonly api = inject(ManagementReportApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Management',
    title: 'Management reports',
    description: 'Turn learning data into clear decisions for teams and leadership.',
    icon: 'chart',
    primaryAction: 'Generate report',
    secondaryAction: 'Back to dashboard',
    secondaryRoute: '/management/overview',
    stats: [
      { label: 'Reports generated', value: '18', change: '+4 this quarter', tone: 'blue' },
      { label: 'Scheduled reports', value: '6', change: 'Monthly cadence', tone: 'green' },
      { label: 'Decision readiness', value: '92%', change: 'Data complete', tone: 'violet' },
      { label: 'Exports this month', value: '24', change: '+18% vs last month', tone: 'orange' },
    ],
    items: [
      {
        title: 'Q3 learning impact report',
        subtitle: 'Quarterly report',
        meta: 'Ready to share',
        status: 'Ready',
        statusTone: 'green',
        action: 'View report',
      },
      {
        title: 'Team participation overview',
        subtitle: 'Monthly report',
        meta: 'Scheduled Oct 01',
        status: 'Scheduled',
        statusTone: 'blue',
        action: 'Edit schedule',
      },
      {
        title: 'Compliance completion',
        subtitle: 'Compliance report',
        meta: 'Updated today',
        status: 'Ready',
        statusTone: 'green',
        action: 'View report',
      },
    ],
  };
  constructor() {
    this.api.list().subscribe();
  }
}
