import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CourseReviewApiService } from '../data-access/course-review-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-course-review-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewPage {
  private readonly api = inject(CourseReviewApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Management',
    title: 'Course review queue',
    description: 'Review submitted courses and keep quality standards high across the catalog.',
    icon: 'clipboard',
    primaryAction: 'Review next course',
    secondaryAction: 'View catalog',
    secondaryRoute: '/management/catalog',
    stats: [
      { label: 'Awaiting review', value: '8', change: '3 due today', tone: 'orange' },
      { label: 'Approved this month', value: '24', change: '+18% vs last month', tone: 'green' },
      { label: 'Changes requested', value: '6', change: 'Across 4 authors', tone: 'violet' },
      { label: 'Average review time', value: '1.8d', change: 'Within target', tone: 'blue' },
    ],
    items: [
      {
        title: 'API Design Fundamentals',
        subtitle: 'Submitted by Priya Nair',
        meta: 'Today',
        status: 'Awaiting review',
        statusTone: 'orange',
        action: 'Review course',
      },
      {
        title: 'Playwright Automation Testing',
        subtitle: 'Submitted by Maya Thompson',
        meta: 'Yesterday',
        status: 'Awaiting review',
        statusTone: 'orange',
        action: 'Review course',
      },
      {
        title: 'Selenium with Java',
        subtitle: 'Submitted by Daniel Carter',
        meta: 'Sep 21',
        status: 'Approved',
        statusTone: 'green',
        action: 'View decision',
      },
    ],
  };
  constructor() {
    this.api.queue().subscribe();
  }
}
