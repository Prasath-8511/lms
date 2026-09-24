import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig } from '../../../shared/models/feature-page.models';

@Component({
  selector: 'app-admin-catalogue-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCataloguePage {
  private readonly api = inject(AdminApiService);
  protected readonly config: FeaturePageConfig = {
    eyebrow: 'Administration',
    title: 'Catalogue governance',
    description: 'Keep course ownership, publishing quality, and catalog metadata organized.',
    icon: 'book',
    primaryAction: 'Add course',
    secondaryAction: 'View audit log',
    secondaryRoute: '/admin/audit',
    stats: [
      { label: 'Published courses', value: '86', change: '+6 this month', tone: 'blue' },
      { label: 'In review', value: '8', change: '3 due today', tone: 'orange' },
      { label: 'Archived', value: '14', change: 'Historical', tone: 'gray' },
      { label: 'Catalog health', value: '96%', change: 'Metadata complete', tone: 'green' },
    ],
    items: [
      {
        title: 'Advanced Angular Development',
        subtitle: 'Owner · Maya Thompson',
        meta: 'Published',
        status: 'Healthy',
        statusTone: 'green',
        action: 'Manage course',
      },
      {
        title: 'API Design Fundamentals',
        subtitle: 'Owner · Priya Nair',
        meta: 'In review',
        status: 'In review',
        statusTone: 'orange',
        action: 'Review course',
      },
      {
        title: 'Legacy Java Patterns',
        subtitle: 'Owner · Daniel Carter',
        meta: 'Archived',
        status: 'Archived',
        statusTone: 'gray',
        action: 'View record',
      },
    ],
  };
  constructor() {
    this.api.listCatalogue().subscribe();
  }
}
