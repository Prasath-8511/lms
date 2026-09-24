import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstructorCourseApiService } from '../data-access/instructor-course-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-instructor-courses-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorCoursesPage {
  private readonly api = inject(InstructorCourseApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Instructor',
    title: 'My courses',
    description: 'Create, organize, and submit your learning content for review.',
    icon: 'book',
    primaryAction: 'Create course',
    secondaryAction: 'View analytics',
    secondaryRoute: '/instructor/reports',
    stats: [
      { label: 'Owned courses', value: '12', change: '+2 this quarter', tone: 'blue' },
      { label: 'Published', value: '9', change: '75% of catalog', tone: 'green' },
      { label: 'In review', value: '2', change: 'Action needed', tone: 'orange' },
      { label: 'Learners', value: '248', change: '+18 this month', tone: 'violet' },
    ],
    items: [
      {
        title: 'Advanced Angular Development',
        subtitle: 'Course · Published',
        meta: '86 learners',
        status: 'Published',
        statusTone: 'green',
        action: 'Edit course',
      },
      {
        title: 'API Design Fundamentals',
        subtitle: 'Course · Draft',
        meta: 'Not published',
        status: 'Draft',
        statusTone: 'gray',
        action: 'Continue editing',
      },
      {
        title: 'Playwright Automation Testing',
        subtitle: 'Course · In review',
        meta: '42 learners',
        status: 'In review',
        statusTone: 'orange',
        action: 'View review',
      },
    ],
  };
  constructor() {
    this.api.listOwned().subscribe();
  }
}
