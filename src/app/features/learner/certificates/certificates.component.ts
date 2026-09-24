import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CertificateApiService } from '../data-access/certificate-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-certificates-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatesPage {
  private readonly api = inject(CertificateApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Learner',
    title: 'Certificates',
    description: 'View, verify, and download the credentials you have earned.',
    icon: 'award',
    primaryAction: 'Explore courses',
    primaryRoute: '/courses',
    secondaryAction: 'View learning progress',
    secondaryRoute: '/progress',
    stats: [
      { label: 'Earned', value: '5', change: 'Verified credentials', tone: 'green' },
      { label: 'This quarter', value: '2', change: '+1 this month', tone: 'blue' },
      { label: 'Skills verified', value: '12', change: 'Across all certificates', tone: 'violet' },
      { label: 'Expiring soon', value: '0', change: 'Nothing to renew', tone: 'orange' },
    ],
    items: [
      {
        title: 'Angular Enterprise Developer',
        subtitle: 'LearnSphere Academy',
        meta: 'Issued Aug 18, 2026',
        status: 'Verified',
        statusTone: 'green',
        action: 'View certificate',
      },
      {
        title: 'Selenium Testing Practitioner',
        subtitle: 'LearnSphere Academy',
        meta: 'Issued Jul 06, 2026',
        status: 'Verified',
        statusTone: 'green',
        action: 'View certificate',
      },
      {
        title: 'Playwright Automation Specialist',
        subtitle: 'LearnSphere Academy',
        meta: 'Issued May 22, 2026',
        status: 'Verified',
        statusTone: 'green',
        action: 'View certificate',
      },
    ],
  };
  constructor() {
    this.api.list().subscribe();
  }
}
