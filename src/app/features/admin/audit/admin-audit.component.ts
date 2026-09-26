import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

interface AuditEvent {
  id: number;
  event: string;
  actor: string;
  area: string;
  at: string;
  status: string;
}

@Component({
  selector: 'app-admin-audit-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditPage {
  private readonly api = inject(AdminApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Administration',
    title: 'Audit history',
    description: 'Review important platform actions and maintain a clear governance trail.',
    icon: 'clipboard',
    primaryAction: 'Export audit log',
    secondaryAction: 'Back to overview',
    secondaryRoute: '/admin/overview',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No audit events have been recorded yet.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .listAudit()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (events) => this.apply(events as AuditEvent[]),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load the audit history.' }),
      });
  }

  private apply(events: AuditEvent[]): void {
    const items: FeaturePageItem[] = events.map((event) => ({
      id: event.id,
      title: event.event,
      subtitle: `${event.actor} · ${event.area}`,
      meta: event.at,
      status: event.status,
      statusTone: 'blue',
      action: 'View event',
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Events recorded', value: String(events.length), change: 'In this view', tone: 'blue' },
        { label: 'Permission changes', value: String(events.filter((event) => event.area === 'Security').length), change: 'Governance events', tone: 'violet' },
        { label: 'Content events', value: String(events.filter((event) => event.area === 'Content').length), change: 'Course activity', tone: 'green' },
        { label: 'Critical events', value: '0', change: 'All systems normal', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
