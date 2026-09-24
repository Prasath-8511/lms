import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-admin-audit-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditPage {
  private readonly api = inject(AdminApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Administration',
    title: 'Audit history',
    description: 'Review important platform actions and maintain a clear governance trail.',
    icon: 'clipboard',
    primaryAction: 'Export audit log',
    secondaryAction: 'Back to overview',
    secondaryRoute: '/admin/overview',
    stats: [
      { label: 'Events today', value: '248', change: '+12% vs average', tone: 'blue' },
      { label: 'Permission changes', value: '18', change: 'This week', tone: 'violet' },
      { label: 'Critical events', value: '0', change: 'All systems normal', tone: 'green' },
      { label: 'Retention', value: '365d', change: 'Audit policy', tone: 'orange' },
    ],
    items: [
      {
        title: 'Role permission updated',
        subtitle: 'Sam Rivera · Administrator',
        meta: 'Today, 10:42 AM',
        status: 'Logged',
        statusTone: 'blue',
        action: 'View event',
      },
      {
        title: 'Course published',
        subtitle: 'Maya Thompson · Instructor',
        meta: 'Today, 09:18 AM',
        status: 'Logged',
        statusTone: 'green',
        action: 'View event',
      },
      {
        title: 'User invitation accepted',
        subtitle: 'Jordan Lee · Management',
        meta: 'Yesterday, 4:02 PM',
        status: 'Logged',
        statusTone: 'green',
        action: 'View event',
      },
    ],
  };
  constructor() {
    this.api.listAudit().subscribe();
  }
}
