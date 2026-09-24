import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsPage {
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Catalogue',
    title: 'Recommended for you',
    description: 'Continue growing with learning selected from your goals and activity.',
    icon: 'sparkles',
    primaryAction: 'Browse all courses',
    primaryRoute: '/courses',
    secondaryAction: 'Refresh recommendations',
    stats: [
      { label: 'Recommended', value: '8', change: 'Based on your goals', tone: 'blue' },
      { label: 'New this week', value: '3', change: 'Fresh content', tone: 'green' },
      { label: 'Saved courses', value: '12', change: 'Ready when you are', tone: 'violet' },
      { label: 'Skill paths', value: '6', change: 'Matched to you', tone: 'orange' },
    ],
    items: [
      {
        title: 'Advanced Angular Development',
        subtitle: 'Development',
        meta: '72% match',
        status: 'Recommended',
        statusTone: 'blue',
        action: 'View course',
      },
      {
        title: 'SQL for Data Analysis',
        subtitle: 'Data & Analytics',
        meta: '88% match',
        status: 'Recommended',
        statusTone: 'violet',
        action: 'View course',
      },
      {
        title: 'UI/UX Design Essentials',
        subtitle: 'Design',
        meta: '81% match',
        status: 'Recommended',
        statusTone: 'orange',
        action: 'View course',
      },
    ],
  };
}
