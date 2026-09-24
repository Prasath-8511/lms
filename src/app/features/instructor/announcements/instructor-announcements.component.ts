import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstructorAnnouncementApiService } from '../data-access/announcement-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-instructor-announcements-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorAnnouncementsPage {
  private readonly api = inject(InstructorAnnouncementApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Instructor',
    title: 'Course announcements',
    description: 'Keep learners informed with timely updates and useful context.',
    icon: 'megaphone',
    primaryAction: 'Create announcement',
    secondaryAction: 'View all announcements',
    secondaryRoute: '/announcements',
    stats: [
      { label: 'Published', value: '24', change: '+4 this month', tone: 'blue' },
      { label: 'Scheduled', value: '3', change: 'Next 14 days', tone: 'green' },
      { label: 'Read rate', value: '78%', change: '+6% this quarter', tone: 'violet' },
      { label: 'Drafts', value: '2', change: 'Need attention', tone: 'orange' },
    ],
    items: [
      {
        title: 'New module available',
        subtitle: 'Advanced Angular Development',
        meta: 'Sent today',
        status: 'Published',
        statusTone: 'green',
        action: 'View update',
      },
      {
        title: 'Office hours reminder',
        subtitle: 'All courses',
        meta: 'Scheduled Sep 28',
        status: 'Scheduled',
        statusTone: 'blue',
        action: 'Edit update',
      },
      {
        title: 'Assessment opens Friday',
        subtitle: 'Selenium with Java',
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
