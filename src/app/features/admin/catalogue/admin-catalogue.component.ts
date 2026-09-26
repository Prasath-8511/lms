import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminApiService } from '../data-access/admin-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';

interface CatalogueEntry {
  id: number;
  title: string;
  owner: string;
  status: string;
  health: string;
}

@Component({
  selector: 'app-admin-catalogue-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCataloguePage {
  private readonly api = inject(AdminApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Administration',
    title: 'Catalogue governance',
    description: 'Keep course ownership, publishing quality, and catalog metadata organized.',
    icon: 'book',
    primaryAction: 'Add course',
    secondaryAction: 'View audit log',
    secondaryRoute: '/admin/audit',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No courses have been added to the catalogue yet.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .listCatalogue()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (entries) => this.apply(entries as CatalogueEntry[]),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load the catalogue.' }),
      });
  }

  private apply(entries: CatalogueEntry[]): void {
    const items: FeaturePageItem[] = entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      subtitle: `Owner · ${entry.owner}`,
      meta: entry.status,
      status: entry.status,
      statusTone: entry.status === 'Published' ? 'green' : entry.status === 'In review' ? 'orange' : 'gray',
      action: entry.status === 'In review' ? 'Review course' : entry.status === 'Archived' ? 'View record' : 'Manage course',
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Published courses', value: String(entries.filter((entry) => entry.status === 'Published').length), change: 'Live in catalog', tone: 'blue' },
        { label: 'In review', value: String(entries.filter((entry) => entry.status === 'In review').length), change: 'Awaiting approval', tone: 'orange' },
        { label: 'Archived', value: String(entries.filter((entry) => entry.status === 'Archived').length), change: 'Historical', tone: 'violet' },
        { label: 'Catalog health', value: String(entries.length), change: 'Tracked entries', tone: 'green' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
