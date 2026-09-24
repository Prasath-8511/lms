import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AssessmentAuthoringApiService } from '../data-access/assessment-authoring-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-assessment-authoring-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentAuthoringPage {
  private readonly api = inject(AssessmentAuthoringApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Instructor',
    title: 'Assessment authoring',
    description: 'Create meaningful assessments and review learner performance.',
    icon: 'clipboard',
    primaryAction: 'Create assessment',
    secondaryAction: 'View grading queue',
    secondaryRoute: '/instructor/grading',
    stats: [
      { label: 'Assessments', value: '18', change: '+3 this month', tone: 'blue' },
      { label: 'Questions', value: '284', change: 'Across all courses', tone: 'green' },
      { label: 'Needs review', value: '4', change: 'Learner submissions', tone: 'orange' },
      { label: 'Average score', value: '84%', change: '+3.2% this month', tone: 'violet' },
    ],
    items: [
      {
        title: 'Components, signals, and change detection',
        subtitle: 'Advanced Angular Development',
        meta: '20 questions',
        status: 'Published',
        statusTone: 'green',
        action: 'Edit assessment',
      },
      {
        title: 'TestNG framework checkpoint',
        subtitle: 'Selenium with Java',
        meta: '8 questions',
        status: 'Draft',
        statusTone: 'gray',
        action: 'Continue editing',
      },
      {
        title: 'End-to-end test design review',
        subtitle: 'Playwright Automation Testing',
        meta: '4 questions',
        status: 'In review',
        statusTone: 'orange',
        action: 'Review questions',
      },
    ],
  };
  constructor() {
    this.api.list(101).subscribe();
  }
}
