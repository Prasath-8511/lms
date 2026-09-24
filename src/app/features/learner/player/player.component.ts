import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-player-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPage {
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Learning player',
    title: 'Continue where you left off',
    description: 'Pick up a lesson, revisit a concept, and keep your learning streak active.',
    icon: 'play',
    primaryAction: 'Resume lesson',
    primaryRoute: '/courses/101',
    secondaryAction: 'View curriculum',
    stats: [
      { label: 'Current course', value: 'Angular', change: 'Advanced development', tone: 'blue' },
      { label: 'Lesson progress', value: '18/25', change: '72% complete', tone: 'green' },
      { label: 'Time remaining', value: '6h 40m', change: 'At your pace', tone: 'violet' },
      { label: 'Streak', value: '7 days', change: 'Keep it going', tone: 'orange' },
    ],
    items: [
      {
        title: 'Signals and reactive state',
        subtitle: 'Module 1 · Lesson 4',
        meta: '22 min',
        status: 'Current',
        statusTone: 'blue',
        action: 'Resume',
      },
      {
        title: 'Feature boundaries and lazy loading',
        subtitle: 'Module 2 · Lesson 1',
        meta: '20 min',
        status: 'Completed',
        statusTone: 'green',
        action: 'Review',
      },
      {
        title: 'Testing reactive user flows',
        subtitle: 'Module 2 · Lesson 3',
        meta: '18 min',
        status: 'Completed',
        statusTone: 'green',
        action: 'Review',
      },
    ],
  };
}
