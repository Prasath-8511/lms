import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-admin-user-detail-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AdminApiService);
  protected readonly userId = Number(this.route.snapshot.paramMap.get('id') ?? 1);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Administration',
    title: 'User details',
    description: 'Review a user account, access context, and recent activity.',
    icon: 'users',
    primaryAction: 'Edit user',
    secondaryAction: 'Back to users',
    secondaryRoute: '/admin/users',
    stats: [
      { label: 'Account status', value: 'Active', change: 'Last active today', tone: 'green' },
      { label: 'Role', value: 'Learner', change: 'Engineering team', tone: 'blue' },
      { label: 'Learning hours', value: '42h', change: 'This month', tone: 'violet' },
      { label: 'Certificates', value: '5', change: 'Verified', tone: 'orange' },
    ],
    items: [
      {
        title: 'Personal information',
        subtitle: 'Identity',
        meta: 'Alex Johnson',
        status: 'Verified',
        statusTone: 'green',
        action: 'Edit',
      },
      {
        title: 'Role and permissions',
        subtitle: 'Access',
        meta: 'Learner',
        status: 'Active',
        statusTone: 'blue',
        action: 'Review',
      },
      {
        title: 'Recent activity',
        subtitle: 'Audit trail',
        meta: '12 events',
        status: 'Available',
        statusTone: 'violet',
        action: 'View activity',
      },
    ],
  };
  constructor() {
    this.api.getUser(this.userId).subscribe();
  }
}
