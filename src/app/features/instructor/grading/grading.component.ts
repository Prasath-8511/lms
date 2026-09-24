import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GradingApiService } from '../data-access/grading-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-grading-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradingPage {
  private readonly api = inject(GradingApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Instructor',
    title: 'Grading and feedback',
    description: 'Give learners timely, actionable feedback that helps them grow.',
    icon: 'check',
    primaryAction: 'Review next submission',
    secondaryAction: 'View assessment authoring',
    secondaryRoute: '/instructor/courses/101/assessments',
    stats: [
      { label: 'To grade', value: '14', change: '4 due today', tone: 'orange' },
      { label: 'Graded this week', value: '38', change: '+12 vs last week', tone: 'green' },
      { label: 'Average feedback time', value: '1.4d', change: 'Within target', tone: 'blue' },
      { label: 'Feedback quality', value: '4.9/5', change: 'Learner rating', tone: 'violet' },
    ],
    items: [
      {
        title: 'TestNG framework checkpoint',
        subtitle: 'Ravi Patel · Selenium with Java',
        meta: 'Submitted today',
        status: 'To grade',
        statusTone: 'orange',
        action: 'Grade submission',
      },
      {
        title: 'Module reflection',
        subtitle: 'Alex Johnson · Advanced Angular',
        meta: 'Submitted yesterday',
        status: 'To grade',
        statusTone: 'orange',
        action: 'Grade submission',
      },
      {
        title: 'End-to-end test review',
        subtitle: 'Sofia Garcia · Playwright',
        meta: 'Score 94%',
        status: 'Graded',
        statusTone: 'green',
        action: 'View feedback',
      },
    ],
  };
  constructor() {
    this.api.queue(101).subscribe();
  }
}
