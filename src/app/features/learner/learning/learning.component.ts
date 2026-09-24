import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnrollmentApiService } from '../data-access/enrollment-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-learning-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPage {
  private readonly enrollmentApi = inject(EnrollmentApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Learner',
    title: 'Your learning journey',
    description: 'See your active enrollments, deadlines, and next learning actions.',
    icon: 'play',
    primaryAction: 'Find a course',
    primaryRoute: '/courses',
    secondaryAction: 'View certificates',
    secondaryRoute: '/certifications',
    stats: [
      { label: 'Active courses', value: '4', change: '2 in progress', tone: 'blue' },
      { label: 'Weekly goal', value: '72%', change: 'On track', tone: 'green' },
      { label: 'Hours learned', value: '42h', change: '+6.5h this month', tone: 'violet' },
      { label: 'Next deadline', value: '4d', change: 'Advanced Angular', tone: 'orange' },
    ],
    items: [
      {
        title: 'Advanced Angular Development',
        subtitle: 'Course progress',
        meta: '72%',
        status: 'In progress',
        statusTone: 'blue',
        action: 'Continue',
      },
      {
        title: 'Selenium with Java',
        subtitle: 'Course progress',
        meta: '48%',
        status: 'In progress',
        statusTone: 'blue',
        action: 'Continue',
      },
      {
        title: 'Spring Boot REST API Fundamentals',
        subtitle: 'Course progress',
        meta: '24%',
        status: 'In progress',
        statusTone: 'blue',
        action: 'Continue',
      },
    ],
  };
  constructor() {
    this.enrollmentApi.list().subscribe();
  }
}
