import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AssessmentAttemptApiService } from '../data-access/assessment-attempt-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-assessment-attempts-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentAttemptsPage {
  private readonly api = inject(AssessmentAttemptApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Learner',
    title: 'Assessment attempts',
    description: 'Start, submit, and review your assessment attempts in one place.',
    icon: 'clipboard',
    primaryAction: 'Start an assessment',
    primaryRoute: '/assessments',
    secondaryAction: 'View assessments',
    secondaryRoute: '/assessments',
    stats: [
      { label: 'Total attempts', value: '18', change: 'Across 8 courses', tone: 'blue' },
      { label: 'In progress', value: '1', change: 'Ready to finish', tone: 'orange' },
      { label: 'Submitted', value: '14', change: 'Awaiting or graded', tone: 'violet' },
      { label: 'Average score', value: '88%', change: '+4% this quarter', tone: 'green' },
    ],
    items: [
      {
        title: 'Components, signals, and change detection',
        subtitle: 'Advanced Angular Development',
        meta: 'Started today',
        status: 'In progress',
        statusTone: 'orange',
        action: 'Continue attempt',
      },
      {
        title: 'End-to-end test design review',
        subtitle: 'Playwright Automation Testing',
        meta: 'Score 94%',
        status: 'Graded',
        statusTone: 'green',
        action: 'View result',
      },
      {
        title: 'TestNG framework checkpoint',
        subtitle: 'Selenium with Java',
        meta: 'Due Oct 02',
        status: 'Not started',
        statusTone: 'gray',
        action: 'Start attempt',
      },
    ],
  };
  constructor() {
    this.api.list().subscribe();
  }
}
