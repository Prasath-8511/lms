import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CourseContentApiService } from '../data-access/course-content-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-course-content-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseContentPage {
  private readonly api = inject(CourseContentApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Instructor',
    title: 'Course content',
    description: 'Shape modules and lessons into a clear, engaging learning journey.',
    icon: 'book',
    primaryAction: 'Add module',
    secondaryAction: 'Submit for review',
    stats: [
      { label: 'Modules', value: '8', change: 'Across 4 courses', tone: 'blue' },
      { label: 'Lessons', value: '116', change: '+12 this month', tone: 'green' },
      { label: 'Draft content', value: '14', change: 'Needs review', tone: 'orange' },
      { label: 'Published', value: '102', change: '88% ready', tone: 'violet' },
    ],
    items: [
      {
        title: 'Modern Angular foundations',
        subtitle: 'Module 1 · 5 lessons',
        meta: 'Published',
        status: 'Published',
        statusTone: 'green',
        action: 'Edit module',
      },
      {
        title: 'Architecture for scalable applications',
        subtitle: 'Module 2 · 3 lessons',
        meta: 'Published',
        status: 'Published',
        statusTone: 'green',
        action: 'Edit module',
      },
      {
        title: 'Testing and release workflows',
        subtitle: 'Module 3 · Draft',
        meta: 'Not published',
        status: 'Draft',
        statusTone: 'gray',
        action: 'Continue editing',
      },
    ],
  };
  constructor() {
    this.api.getModules(101).subscribe();
  }
}
