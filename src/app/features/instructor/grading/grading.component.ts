import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { GradingApiService, GradingItem } from '../data-access/grading-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';

@Component({
  selector: 'app-grading-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  template: '<app-feature-page [config]="config()" (itemAction)="openGrade($event)" />@if (selectedId() !== null) {<app-resource-form-dialog [open]="true" title="Grade submission" description="Record the score and feedback for this learner submission." [fields]="gradeFields" [submitting]="submitting()" [errorMessage]="errorMessage()" submitLabel="Save grade" (invalid)="errorMessage.set($event)" (value)="grade($event)" (cancelled)="closeDialog()" />}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradingPage {
  private readonly api = inject(GradingApiService);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly gradeFields: ResourceField[] = [
    { key: 'score', label: 'Score', type: 'number', required: true, min: 0, max: 100, hint: 'Enter a score between 0 and 100.' },
    { key: 'feedback', label: 'Feedback', type: 'textarea', placeholder: 'Share actionable feedback with the learner.' },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Instructor',
    title: 'Grading and feedback',
    description: 'Give learners timely, actionable feedback that helps them grow.',
    icon: 'check',
    primaryAction: 'Review next submission',
    secondaryAction: 'View assessment authoring',
    secondaryRoute: '/instructor/courses/101/assessments',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No submissions are waiting for grading.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .queue(101)
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (queue) => this.apply(queue),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load the grading queue.' }),
      });
  }

  protected openGrade(item: FeaturePageItem): void {
    this.selectedId.set(item.id ?? null);
    this.errorMessage.set('');
  }

  protected closeDialog(): void {
    this.selectedId.set(null);
    this.errorMessage.set('');
  }

  protected grade(value: ResourceFormValue): void {
    const id = this.selectedId();
    if (id === null || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.api
      .submit(id, { score: Number(value['score']), feedback: String(value['feedback'] ?? '') })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.closeDialog();
          this.load();
        },
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to save this grade.' }),
      });
  }

  private apply(queue: GradingItem[]): void {
    const items: FeaturePageItem[] = queue.map((item) => ({
      id: item.id,
      title: item.assignmentTitle,
      subtitle: item.learnerName,
      meta: item.score === undefined ? item.submittedAt : `Score ${item.score}%`,
      status: item.status,
      statusTone: item.status === 'Graded' ? 'green' : 'orange',
      action: item.status === 'Graded' ? 'View feedback' : 'Grade submission',
    }));
    const graded = queue.filter((item) => item.status === 'Graded');
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'To grade', value: String(queue.filter((item) => item.status !== 'Graded').length), change: 'Awaiting review', tone: 'orange' },
        { label: 'Graded', value: String(graded.length), change: 'Completed', tone: 'green' },
        { label: 'Average score', value: graded.length ? `${Math.round(graded.reduce((total, item) => total + (item.score ?? 0), 0) / graded.length)}%` : '—', change: 'Across graded work', tone: 'blue' },
        { label: 'Submissions', value: String(queue.length), change: 'In this queue', tone: 'violet' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
