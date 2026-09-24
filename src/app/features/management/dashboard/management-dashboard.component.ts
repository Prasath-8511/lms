import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ManagementDashboardApiService } from '../data-access/dashboard-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-management-dashboard-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementDashboardPage {
  private readonly api = inject(ManagementDashboardApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Management',
    title: 'Learning health dashboard',
    description: 'Monitor participation, progress, and impact across the organization.',
    icon: 'chart',
    primaryAction: 'View learning health',
    secondaryAction: 'Generate report',
    secondaryRoute: '/management/reports',
    stats: [
      { label: 'Active learners', value: '1,842', change: '+12.8% this month', tone: 'blue' },
      { label: 'Completion rate', value: '74%', change: '+4.2% vs last month', tone: 'green' },
      { label: 'Learning hours', value: '6,420', change: '+18% this quarter', tone: 'violet' },
      { label: 'Certificates', value: '486', change: '+32 this month', tone: 'orange' },
    ],
    items: [
      {
        title: 'Frontend Engineering Path',
        subtitle: 'Learning path',
        meta: '78% complete',
        status: 'On track',
        statusTone: 'green',
        action: 'View program',
      },
      {
        title: 'Quality Engineering Path',
        subtitle: 'Learning path',
        meta: '71% complete',
        status: 'On track',
        statusTone: 'green',
        action: 'View program',
      },
      {
        title: 'Security awareness 2026',
        subtitle: 'Compliance',
        meta: '89% complete',
        status: 'On track',
        statusTone: 'blue',
        action: 'View program',
      },
    ],
  };
  constructor() {
    this.api.getSummary().subscribe();
  }
}
