import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

interface AdminRole {
  id: number;
  name: string;
  description: string;
  permissions: number;
  status: string;
}

@Component({
  selector: 'app-admin-roles-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRolesPage {
  private readonly api = inject(AdminApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Administration',
    title: 'Roles and permissions',
    description: 'Define what each role can access and keep governance consistent.',
    icon: 'lock',
    primaryAction: 'Create role',
    secondaryAction: 'Permission audit',
    secondaryRoute: '/admin/audit',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No roles have been defined yet.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .listRoles()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (roles) => this.apply(roles as AdminRole[]),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load roles.' }),
      });
  }

  private apply(roles: AdminRole[]): void {
    const items: FeaturePageItem[] = roles.map((role) => ({
      id: role.id,
      title: role.name,
      subtitle: role.description,
      meta: `${role.permissions} permissions`,
      status: role.status,
      statusTone: 'green',
      action: 'View role',
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Roles', value: String(roles.length), change: 'Current access model', tone: 'blue' },
        { label: 'Permission rules', value: String(roles.reduce((total, role) => total + role.permissions, 0)), change: 'Across platform', tone: 'green' },
        { label: 'Active roles', value: String(roles.filter((role) => role.status === 'Active').length), change: 'In use', tone: 'violet' },
        { label: 'Pending changes', value: '0', change: 'No approvals waiting', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
