import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnrollmentApiService } from '../data-access/enrollment-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPage {
  private readonly enrollmentApi = inject(EnrollmentApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Learner',
    title: 'Learning progress',
    description: 'Track completion, learning hours, and the milestones you are building toward.',
    icon: 'trend',
    primaryAction: 'View learning',
    primaryRoute: '/my-learning',
    secondaryAction: 'Download summary',
    stats: [
      { label: 'Overall progress', value: '72%', change: '+6.4% this month', tone: 'blue' },
      { label: 'Lessons completed', value: '42', change: 'Across 4 courses', tone: 'green' },
      { label: 'Learning time', value: '42h', change: '+6.5h this month', tone: 'violet' },
      { label: 'Certificates', value: '5', change: '2 this quarter', tone: 'orange' },
    ],
    items: [
      {
        title: 'Advanced Angular Development',
        subtitle: '18 of 25 lessons',
        meta: '72%',
        status: 'On track',
        statusTone: 'green',
        action: 'View details',
      },
      {
        title: 'Selenium with Java',
        subtitle: '10 of 20 lessons',
        meta: '48%',
        status: 'On track',
        statusTone: 'blue',
        action: 'View details',
      },
      {
        title: 'Playwright Automation Testing',
        subtitle: '15 of 18 lessons',
        meta: '86%',
        status: 'On track',
        statusTone: 'green',
        action: 'View details',
      },
    ],
  };
  constructor() {
    this.enrollmentApi.list().subscribe();
  }
}
