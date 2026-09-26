import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminApiService, AdminUser } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  template: '<app-feature-page [config]="config()" (primaryAction)="openInvite()" />@if (dialogOpen()) {<app-resource-form-dialog [open]="true" title="Invite user" description="Send an invitation to a new team member." [fields]="inviteFields" [submitting]="submitting()" [errorMessage]="errorMessage()" submitLabel="Send invitation" (invalid)="errorMessage.set($event)" (value)="invite($event)" (cancelled)="closeInvite()" />}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPage {
  private readonly api = inject(AdminApiService);
  protected readonly dialogOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly inviteFields: ResourceField[] = [{ key: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'name@company.com' }, { key: 'role', label: 'Role', type: 'select', required: true, options: [{ label: 'Learner', value: 'learner' }, { label: 'Instructor', value: 'instructor' }, { label: 'Management', value: 'management' }, { label: 'Admin', value: 'admin' }] }];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Administration', title: 'User management', description: 'Manage people, roles, invitations, and account status across the platform.', icon: 'users', primaryAction: 'Invite user', secondaryAction: 'Role permissions', secondaryRoute: '/admin/roles', stats: [], items: [], loading: true, errorMessage: '', emptyMessage: 'No users have been added yet.',
  });

  constructor() { this.load(); }

  private load(): void {
    this.api.listUsers().pipe(finalize(() => this.config.update((config) => ({ ...config, loading: false })))).subscribe({
      next: (users) => this.updateConfig(users),
      error: (error: { error?: { message?: string }; message?: string }) => this.config.update((config) => ({ ...config, errorMessage: error.error?.message ?? error.message ?? 'Unable to load users.' })),
    });
  }

  protected openInvite(): void { this.errorMessage.set(''); this.dialogOpen.set(true); }
  protected closeInvite(): void { this.dialogOpen.set(false); this.errorMessage.set(''); }

  protected invite(value: ResourceFormValue): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.api.inviteUser({ email: String(value['email']).trim(), role: String(value['role']) }).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.closeInvite(); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(error.error?.message ?? error.message ?? 'Unable to send this invitation.') });
  }

  private updateConfig(users: AdminUser[]): void {
    const items: FeaturePageItem[] = users.map((user) => ({ id: user.id, title: user.name, subtitle: `${user.role} · ${user.email}`, meta: user.status, status: user.status, statusTone: user.status === 'Active' ? 'green' : 'orange', action: 'Manage user', route: `/admin/users/${user.id}` }));
    this.config.update((config) => ({ ...config, errorMessage: '', items, stats: [{ label: 'Total users', value: String(users.length), change: 'Across all roles', tone: 'blue' }, { label: 'Active users', value: String(users.filter((user) => user.status === 'Active').length), change: 'Signed in', tone: 'green' }, { label: 'Pending invites', value: String(users.filter((user) => user.status === 'Invited').length), change: 'Awaiting acceptance', tone: 'orange' }, { label: 'Administrators', value: String(users.filter((user) => user.role === 'admin').length), change: 'Full access', tone: 'violet' }] }));
  }
}

