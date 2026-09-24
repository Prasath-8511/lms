import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ManagementDashboardApiService } from '../data-access/dashboard-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-management-enrollment-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementEnrollmentPage {
  private readonly api = inject(ManagementDashboardApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Management',
    title: 'Enrollment management',
    description: 'Monitor enrollment activity and help learners find the right programs.',
    icon: 'users',
    primaryAction: 'Open learner report',
    secondaryAction: 'Learning dashboard',
    secondaryRoute: '/management/dashboard',
    stats: [
      { label: 'Total enrollments', value: '3,184', change: '+218 this month', tone: 'blue' },
      { label: 'Active learners', value: '1,842', change: '58% of enrollments', tone: 'green' },
      { label: 'Pending requests', value: '86', change: '12 fewer this week', tone: 'orange' },
      { label: 'Completion rate', value: '74%', change: '+4.2% vs last month', tone: 'violet' },
    ],
    items: [
      {
        title: 'Frontend Engineering Path',
        subtitle: 'Learning path',
        meta: '642 learners',
        status: 'On track',
        statusTone: 'green',
        action: 'View enrollments',
      },
      {
        title: 'Quality Engineering Path',
        subtitle: 'Learning path',
        meta: '418 learners',
        status: 'On track',
        statusTone: 'green',
        action: 'View enrollments',
      },
      {
        title: 'Security awareness 2026',
        subtitle: 'Compliance',
        meta: '568 learners',
        status: 'On track',
        statusTone: 'blue',
        action: 'View enrollments',
      },
    ],
  };
  constructor() {
    this.api.getSummary().subscribe();
  }
}
