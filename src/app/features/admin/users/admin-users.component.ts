import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPage {
  private readonly api = inject(AdminApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Administration',
    title: 'User management',
    description: 'Manage people, roles, invitations, and account status across the platform.',
    icon: 'users',
    primaryAction: 'Invite user',
    secondaryAction: 'Role permissions',
    secondaryRoute: '/admin/roles',
    stats: [
      { label: 'Total users', value: '12,480', change: '+1,024 this month', tone: 'blue' },
      { label: 'Active users', value: '9,842', change: '79% of total', tone: 'green' },
      { label: 'Pending invites', value: '36', change: '8 expire soon', tone: 'orange' },
      { label: 'Suspended', value: '12', change: 'Needs review', tone: 'violet' },
    ],
    items: [
      {
        title: 'Alex Johnson',
        subtitle: 'Learner · Engineering',
        meta: 'Active today',
        status: 'Active',
        statusTone: 'green',
        action: 'Manage user',
      },
      {
        title: 'Maya Thompson',
        subtitle: 'Instructor · Learning',
        meta: 'Active 2h ago',
        status: 'Active',
        statusTone: 'green',
        action: 'Manage user',
      },
      {
        title: 'Jordan Lee',
        subtitle: 'Manager · People Ops',
        meta: 'Invited today',
        status: 'Pending',
        statusTone: 'orange',
        action: 'Manage invite',
      },
    ],
  };
  constructor() {
    this.api.listUsers().subscribe();
  }
}
