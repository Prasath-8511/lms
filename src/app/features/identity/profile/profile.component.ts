import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { UserApiService, UserProfile } from '../data-access/user-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  template: '<app-feature-page [config]="config()" (primaryAction)="openEdit()" />@if (dialogOpen()) {<app-resource-form-dialog [open]="true" title="Edit profile" description="Keep your account details up to date." [fields]="editFields" [initialValue]="formValue()" [submitting]="submitting()" [errorMessage]="errorMessage()" submitLabel="Save profile" (invalid)="errorMessage.set($event)" (value)="save($event)" (cancelled)="closeDialog()" />}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly api = inject(UserApiService);
  protected readonly dialogOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly formValue = signal<ResourceFormValue>({});
  protected readonly editFields: ResourceField[] = [
    { key: 'name', label: 'Full name', type: 'text', required: true },
    { key: 'email', label: 'Email address', type: 'email', required: true },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Your account',
    title: 'Profile and preferences',
    description: 'Keep your identity, goals, and learning preferences up to date.',
    icon: 'users',
    primaryAction: 'Edit profile',
    secondaryAction: 'Account settings',
    secondaryRoute: '/settings',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'Your profile could not be loaded.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .getMe()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (profile) => this.apply(profile),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load your profile.' }),
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
      .updateMe({ name: String(value['name']).trim(), email: String(value['email']).trim() })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (profile) => {
          this.closeDialog();
          this.apply(profile);
        },
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to save your profile.' }),
      });
  }

  private apply(profile: UserProfile): void {
    this.formValue.set({ name: profile.name, email: profile.email });
    const items: FeaturePageItem[] = [
      { id: profile.id, title: 'Personal information', subtitle: 'Identity', meta: profile.name, status: profile.email, statusTone: 'green', action: 'Edit' },
      { id: profile.id, title: 'Role', subtitle: 'Access', meta: profile.role, status: 'Active', statusTone: 'blue', action: 'Review' },
      { id: profile.id, title: 'Notification settings', subtitle: 'Communication', meta: 'Email + in-app', status: 'Enabled', statusTone: 'green', action: 'Manage' },
    ];
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Name', value: profile.name, change: 'Account holder', tone: 'green' },
        { label: 'Email', value: profile.email, change: 'Primary contact', tone: 'blue' },
        { label: 'Role', value: profile.role, change: 'Current access', tone: 'violet' },
        { label: 'User ID', value: String(profile.id), change: 'Internal identifier', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
