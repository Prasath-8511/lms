import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  ManagedAnnouncement,
  ManagementAnnouncementApiService,
} from '../data-access/announcement-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';

@Component({
  selector: 'app-management-announcements-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  template: '<app-feature-page [config]="config()" (primaryAction)="openCreate()" />@if (dialogOpen()) {<app-resource-form-dialog [open]="true" title="Create announcement" description="Communicate an important update across the organization." [fields]="fields" [submitting]="submitting()" [errorMessage]="errorMessage()" submitLabel="Save announcement" (invalid)="errorMessage.set($event)" (value)="create($event)" (cancelled)="closeDialog()" />}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementAnnouncementsPage {
  private readonly api = inject(ManagementAnnouncementApiService);
  protected readonly dialogOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly fields: ResourceField[] = [
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'What should the organization know?' },
    { key: 'audience', label: 'Audience', type: 'text', required: true, placeholder: 'e.g. Organization-wide' },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Management',
    title: 'Organization announcements',
    description: 'Communicate important updates and keep every team connected.',
    icon: 'megaphone',
    primaryAction: 'Create announcement',
    secondaryAction: 'View learner announcements',
    secondaryRoute: '/announcements',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'You have not posted any announcements yet.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .list()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (announcements) => this.apply(announcements),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load announcements.' }),
      });
  }

  protected openCreate(): void {
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
    this.errorMessage.set('');
  }

  protected create(value: ResourceFormValue): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.api
      .create({ title: String(value['title']).trim(), audience: String(value['audience']).trim() })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.closeDialog();
          this.load();
        },
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to create this announcement.' }),
      });
  }

  private apply(announcements: ManagedAnnouncement[]): void {
    const items: FeaturePageItem[] = announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      subtitle: announcement.audience,
      meta: announcement.publishedAt,
      status: announcement.status,
      statusTone: announcement.status === 'Published' ? 'green' : announcement.status === 'Scheduled' ? 'blue' : 'gray',
      action: announcement.status === 'Draft' ? 'Continue editing' : 'View update',
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Published', value: String(announcements.filter((item) => item.status === 'Published').length), change: 'Sent to audience', tone: 'blue' },
        { label: 'Scheduled', value: String(announcements.filter((item) => item.status === 'Scheduled').length), change: 'Upcoming', tone: 'green' },
        { label: 'Drafts', value: String(announcements.filter((item) => item.status === 'Draft').length), change: 'Need attention', tone: 'orange' },
        { label: 'Audiences', value: String(new Set(announcements.map((item) => item.audience)).size), change: 'Distinct groups', tone: 'violet' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
