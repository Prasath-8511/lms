import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  InstructorAnnouncement,
  InstructorAnnouncementApiService,
} from '../data-access/announcement-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';

@Component({
  selector: 'app-instructor-announcements-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  template: '<app-feature-page [config]="config()" (primaryAction)="openCreate()" />@if (dialogOpen()) {<app-resource-form-dialog [open]="true" title="Create announcement" description="Share an update with the learners in your course." [fields]="fields" [submitting]="submitting()" [errorMessage]="errorMessage()" submitLabel="Save announcement" (invalid)="errorMessage.set($event)" (value)="create($event)" (cancelled)="closeDialog()" />}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorAnnouncementsPage {
  private readonly api = inject(InstructorAnnouncementApiService);
  protected readonly dialogOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly fields: ResourceField[] = [
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'What should learners know?' },
    { key: 'courseTitle', label: 'Course', type: 'text', required: true, placeholder: 'Course name' },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Instructor',
    title: 'Course announcements',
    description: 'Keep learners informed with timely updates and useful context.',
    icon: 'megaphone',
    primaryAction: 'Create announcement',
    secondaryAction: 'View all announcements',
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
      .create({ title: String(value['title']).trim(), courseTitle: String(value['courseTitle']).trim() })
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

  private apply(announcements: InstructorAnnouncement[]): void {
    const items: FeaturePageItem[] = announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      subtitle: announcement.courseTitle,
      meta: announcement.sentAt,
      status: announcement.status,
      statusTone: announcement.status === 'Published' ? 'green' : announcement.status === 'Scheduled' ? 'blue' : 'gray',
      action: announcement.status === 'Draft' ? 'Continue editing' : 'View update',
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Published', value: String(announcements.filter((item) => item.status === 'Published').length), change: 'Sent to learners', tone: 'blue' },
        { label: 'Scheduled', value: String(announcements.filter((item) => item.status === 'Scheduled').length), change: 'Upcoming', tone: 'green' },
        { label: 'Drafts', value: String(announcements.filter((item) => item.status === 'Draft').length), change: 'Need attention', tone: 'orange' },
        { label: 'Courses covered', value: String(new Set(announcements.map((item) => item.courseTitle)).size), change: 'Distinct courses', tone: 'violet' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
