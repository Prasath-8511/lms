import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminApiService, AdminUser } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';

@Component({
  selector: 'app-admin-user-detail-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  template: '<app-feature-page [config]="config()" (primaryAction)="openEdit()" />@if (dialogOpen()) {<app-resource-form-dialog [open]="true" title="Edit user" description="Update this user’s role or account status." [fields]="editFields" [initialValue]="formValue()" [submitting]="submitting()" [errorMessage]="errorMessage()" submitLabel="Save changes" (invalid)="errorMessage.set($event)" (value)="save($event)" (cancelled)="closeDialog()" />}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AdminApiService);
  protected readonly userId = Number(this.route.snapshot.paramMap.get('id') ?? 1);
  protected readonly dialogOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly formValue = signal<ResourceFormValue>({});
  protected readonly editFields: ResourceField[] = [
    { key: 'name', label: 'Full name', type: 'text', required: true },
    { key: 'email', label: 'Email address', type: 'email', required: true },
    { key: 'role', label: 'Role', type: 'select', required: true, options: [{ label: 'Learner', value: 'learner' }, { label: 'Instructor', value: 'instructor' }, { label: 'Management', value: 'management' }, { label: 'Admin', value: 'admin' }] },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'Active' }, { label: 'Invited', value: 'Invited' }, { label: 'Suspended', value: 'Suspended' }] },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Administration',
    title: 'User details',
    description: 'Review a user account, access context, and recent activity.',
    icon: 'users',
    primaryAction: 'Edit user',
    secondaryAction: 'Back to users',
    secondaryRoute: '/admin/users',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'This user could not be loaded.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .getUser(this.userId)
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (user) => this.apply(user),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load this user.' }),
      });
  }

  protected openEdit(): void {
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
    this.errorMessage.set('');
  }

  protected save(value: ResourceFormValue): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.api
      .updateUser(this.userId, {
        name: String(value['name']).trim(),
        email: String(value['email']).trim(),
        role: String(value['role']),
        status: String(value['status']),
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (user) => {
          this.closeDialog();
          this.apply(user);
        },
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to save this user.' }),
      });
  }

  private apply(user: AdminUser): void {
    this.formValue.set({ name: user.name, email: user.email, role: user.role, status: user.status });
    const items: FeaturePageItem[] = [
      { id: user.id, title: 'Personal information', subtitle: 'Identity', meta: user.name, status: user.email, statusTone: 'blue', action: 'Edit' },
      { id: user.id, title: 'Role and permissions', subtitle: 'Access', meta: user.role, status: 'Active', statusTone: 'green', action: 'Review' },
      { id: user.id, title: 'Account status', subtitle: 'Governance', meta: user.status, status: user.status, statusTone: user.status === 'Active' ? 'green' : 'orange', action: 'View activity' },
    ];
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Account status', value: user.status, change: user.email, tone: user.status === 'Active' ? 'green' : 'orange' },
        { label: 'Role', value: user.role, change: 'Current access level', tone: 'blue' },
        { label: 'User ID', value: String(user.id), change: 'Internal identifier', tone: 'violet' },
        { label: 'Sections', value: String(items.length), change: 'Available on this page', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
