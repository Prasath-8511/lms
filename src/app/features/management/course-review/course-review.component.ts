import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CourseReview, CourseReviewApiService } from '../data-access/course-review-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';

@Component({
  selector: 'app-course-review-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  template: '<app-feature-page [config]="config()" (itemAction)="openReview($event)" />@if (selectedId() !== null) {<app-resource-form-dialog [open]="true" title="Review course" description="Approve this course for publication or request changes from the author." [fields]="reviewFields" [submitting]="submitting()" [errorMessage]="errorMessage()" submitLabel="Submit decision" (invalid)="errorMessage.set($event)" (value)="decide($event)" (cancelled)="closeReview()" />}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewPage {
  private readonly api = inject(CourseReviewApiService);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly reviewFields: ResourceField[] = [{ key: 'decision', label: 'Decision', type: 'select', required: true, options: [{ label: 'Approved', value: 'approved' }, { label: 'Changes requested', value: 'changes_requested' }] }, { key: 'reason', label: 'Notes for the author', type: 'textarea', placeholder: 'Explain the decision or required changes' }];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Management', title: 'Course review queue', description: 'Review submitted courses and keep quality standards high across the catalog.', icon: 'clipboard', primaryAction: 'Review next course', secondaryAction: 'View catalog', secondaryRoute: '/management/catalog', stats: [], items: [], loading: true, errorMessage: '', emptyMessage: 'No courses are waiting for review.',
  });

  constructor() { this.load(); }

  private load(): void {
    this.api.queue().pipe(finalize(() => this.config.update((config) => ({ ...config, loading: false })))).subscribe({
      next: (reviews) => this.updateConfig(reviews),
      error: (error: { error?: { message?: string }; message?: string }) => this.config.update((config) => ({ ...config, errorMessage: error.error?.message ?? error.message ?? 'Unable to load the review queue.' })),
    });
  }

  protected openReview(item: FeaturePageItem): void {
    this.selectedId.set(item.id ?? null);
    this.errorMessage.set('');
  }

  protected closeReview(): void {
    this.selectedId.set(null);
    this.errorMessage.set('');
  }

  protected decide(value: ResourceFormValue): void {
    const id = this.selectedId();
    if (id === null || this.submitting()) return;
    this.submitting.set(true);
    this.api.decide(id, value['decision'] === 'approved' ? 'approved' : 'changes_requested', String(value['reason'] ?? '')).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.closeReview(); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(error.error?.message ?? error.message ?? 'Unable to submit this review decision.') });
  }

  private updateConfig(reviews: CourseReview[]): void {
    const items: FeaturePageItem[] = reviews.map((review) => ({ id: review.id, title: review.title, subtitle: `Submitted by ${review.submittedBy}`, meta: review.submittedAt, status: review.status, statusTone: review.status === 'Approved' ? 'green' : review.status === 'Changes requested' ? 'orange' : 'blue', action: review.status === 'Approved' ? 'View decision' : 'Review course' }));
    this.config.update((config) => ({ ...config, errorMessage: '', items, stats: [{ label: 'Awaiting review', value: String(reviews.filter((review) => review.status === 'Awaiting review').length), change: 'Needs a decision', tone: 'orange' }, { label: 'Approved', value: String(reviews.filter((review) => review.status === 'Approved').length), change: 'Published or cleared', tone: 'green' }, { label: 'Changes requested', value: String(reviews.filter((review) => review.status === 'Changes requested').length), change: 'Returned to authors', tone: 'violet' }, { label: 'Total in queue', value: String(reviews.length), change: 'Current queue', tone: 'blue' }] }));
  }
}

