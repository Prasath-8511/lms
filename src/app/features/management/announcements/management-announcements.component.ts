import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ManagementAnnouncementApiService } from '../data-access/announcement-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-management-announcements-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementAnnouncementsPage {
  private readonly api = inject(ManagementAnnouncementApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Management',
    title: 'Organization announcements',
    description: 'Communicate important updates and keep every team connected.',
    icon: 'megaphone',
    primaryAction: 'Create announcement',
    secondaryAction: 'View learner announcements',
    secondaryRoute: '/announcements',
    stats: [
      { label: 'Published', value: '42', change: '+8 this month', tone: 'blue' },
      { label: 'Scheduled', value: '6', change: 'Next 30 days', tone: 'green' },
      { label: 'Reach rate', value: '86%', change: 'Across organization', tone: 'violet' },
      { label: 'Drafts', value: '4', change: 'Need review', tone: 'orange' },
    ],
    items: [
      {
        title: 'Q3 learning impact is ready',
        subtitle: 'Organization-wide',
        meta: 'Sent today',
        status: 'Published',
        statusTone: 'green',
        action: 'View update',
      },
      {
        title: 'Security awareness deadline',
        subtitle: 'Compliance',
        meta: 'Scheduled Oct 01',
        status: 'Scheduled',
        statusTone: 'blue',
        action: 'Edit update',
      },
      {
        title: 'New manager essentials',
        subtitle: 'Management program',
        meta: 'Draft',
        status: 'Draft',
        statusTone: 'gray',
        action: 'Continue editing',
      },
    ],
  };
  constructor() {
    this.api.list().subscribe();
  }
}
