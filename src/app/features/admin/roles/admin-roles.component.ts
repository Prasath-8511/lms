import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-admin-roles-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRolesPage {
  private readonly api = inject(AdminApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Administration',
    title: 'Roles and permissions',
    description: 'Define what each role can access and keep governance consistent.',
    icon: 'lock',
    primaryAction: 'Create role',
    secondaryAction: 'Permission audit',
    secondaryRoute: '/admin/audit',
    stats: [
      { label: 'Roles', value: '4', change: 'Current access model', tone: 'blue' },
      { label: 'Permission rules', value: '68', change: 'Across platform', tone: 'green' },
      { label: 'Pending changes', value: '3', change: 'Need approval', tone: 'orange' },
      { label: 'Audit health', value: '100%', change: 'No critical issues', tone: 'violet' },
    ],
    items: [
      {
        title: 'Learner',
        subtitle: 'Role definition',
        meta: '12 permissions',
        status: 'Active',
        statusTone: 'green',
        action: 'View role',
      },
      {
        title: 'Instructor',
        subtitle: 'Role definition',
        meta: '28 permissions',
        status: 'Active',
        statusTone: 'green',
        action: 'View role',
      },
      {
        title: 'Management',
        subtitle: 'Role definition',
        meta: '36 permissions',
        status: 'Active',
        statusTone: 'green',
        action: 'View role',
      },
    ],
  };
  constructor() {
    this.api.listRoles().subscribe();
  }
}
