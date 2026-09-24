import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UserApiService } from '../data-access/user-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly profileApi = inject(UserApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Your account',
    title: 'Profile and preferences',
    description: 'Keep your identity, goals, and learning preferences up to date.',
    icon: 'users',
    primaryAction: 'Edit profile',
    secondaryAction: 'Account settings',
    stats: [
      { label: 'Profile strength', value: '92%', change: 'Almost complete', tone: 'green' },
      { label: 'Learning goal', value: '8h', change: 'This month', tone: 'blue' },
      { label: 'Certificates', value: '5', change: 'Earned', tone: 'violet' },
      { label: 'Member since', value: '2024', change: 'Growing daily', tone: 'orange' },
    ],
    items: [
      {
        title: 'Personal information',
        subtitle: 'Identity',
        meta: 'Alex Johnson',
        status: 'Complete',
        statusTone: 'green',
        action: 'Edit',
      },
      {
        title: 'Learning preferences',
        subtitle: 'Personalization',
        meta: '3 preferences',
        status: 'Configured',
        statusTone: 'blue',
        action: 'Manage',
      },
      {
        title: 'Notification settings',
        subtitle: 'Communication',
        meta: 'Email + in-app',
        status: 'Enabled',
        statusTone: 'green',
        action: 'Manage',
      },
    ],
  };
  constructor() {
    this.profileApi.getMe().subscribe();
  }
}
