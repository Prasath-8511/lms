import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnrollmentApiService } from '../data-access/enrollment-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-enrollments-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrollmentsPage {
  private readonly enrollmentApi = inject(EnrollmentApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Learner',
    title: 'My enrollments',
    description: 'Manage active course enrollments and keep your learning commitments visible.',
    icon: 'clipboard',
    primaryAction: 'Browse catalog',
    primaryRoute: '/courses',
    secondaryAction: 'Learning preferences',
    stats: [
      { label: 'Total enrollments', value: '12', change: 'All time', tone: 'blue' },
      { label: 'Active', value: '4', change: 'Currently learning', tone: 'green' },
      { label: 'Completed', value: '8', change: 'Great work', tone: 'violet' },
      { label: 'Opt-outs', value: '0', change: 'None this year', tone: 'orange' },
    ],
    items: [
      {
        title: 'Advanced Angular Development',
        subtitle: 'Enrolled Aug 24, 2026',
        meta: '72% complete',
        status: 'Active',
        statusTone: 'green',
        action: 'Manage',
      },
      {
        title: 'Playwright Automation Testing',
        subtitle: 'Enrolled Aug 12, 2026',
        meta: '86% complete',
        status: 'Active',
        statusTone: 'green',
        action: 'Manage',
      },
      {
        title: 'UI/UX Design Essentials',
        subtitle: 'Enrolled Jul 03, 2026',
        meta: '0% complete',
        status: 'Paused',
        statusTone: 'gray',
        action: 'Resume',
      },
    ],
  };
  constructor() {
    this.enrollmentApi.list().subscribe();
  }
}
