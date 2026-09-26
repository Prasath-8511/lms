import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AssessmentAuthoringApiService } from '../data-access/assessment-authoring-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';
import { AssessmentDraft, AssessmentQuestionDraft, AssessmentType, InstructorAssessmentRecord } from '../../../shared/models/lms.models';

@Component({
  selector: 'app-assessment-authoring-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  templateUrl: './assessment-authoring.component.html',
  styleUrl: './assessment-authoring.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentAuthoringPage {
  private readonly api = inject(AssessmentAuthoringApiService);
  protected readonly courseId = 101;
  protected readonly assessments = signal<InstructorAssessmentRecord[]>([]);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly dialogOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly formValue = signal<ResourceFormValue>({});
  protected readonly fields: ResourceField[] = [
    { key: 'title', label: 'Assessment title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'type', label: 'Assessment type', type: 'select', required: true, options: [{ label: 'Quiz', value: 'Quiz' }, { label: 'Assignment', value: 'Assignment' }, { label: 'Project', value: 'Project' }] },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Draft', value: 'Draft' }, { label: 'Published', value: 'Published' }, { label: 'Archived', value: 'Archived' }] },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Instructor', title: 'Assessment authoring', description: 'Create meaningful assessments and review learner performance.', icon: 'clipboard', primaryAction: 'Create assessment', secondaryAction: 'View grading queue', secondaryRoute: '/instructor/grading', stats: [], items: [], loading: false, errorMessage: '', emptyMessage: 'No assessments have been created for this course.',
  });

  constructor() { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.api.list(this.courseId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (assessments) => { this.assessments.set(assessments); this.refreshConfig(); },
      error: (error: { error?: { message?: string }; message?: string }) => { this.errorMessage.set(this.message(error, 'Unable to load assessments.')); this.refreshConfig(); },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.formValue.set({ type: 'Quiz', status: 'Draft' });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected itemAction(item: FeaturePageItem): void {
    const assessment = this.assessments().find((candidate) => candidate.id === item.id);
    if (!assessment) return;
    if (item.action === 'Publish assessment') { this.publish(assessment); return; }
    this.editingId.set(assessment.id);
    this.formValue.set({ title: assessment.title, description: assessment.description, type: assessment.type, status: assessment.status });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void { this.dialogOpen.set(false); this.errorMessage.set(''); }

  protected saveAssessment(value: ResourceFormValue): void {
    if (!String(value['title'] ?? '').trim() || !String(value['description'] ?? '').trim()) { this.errorMessage.set('Title and description are required.'); return; }
    const draft: AssessmentDraft = { title: String(value['title']).trim(), description: String(value['description']).trim(), courseId: this.courseId, type: value['type'] as AssessmentType, status: value['status'] as AssessmentDraft['status'], questions: this.assessments().find((assessment) => assessment.id === this.editingId())?.questions ?? [{ prompt: 'New question', type: 'single-choice', marks: 5, options: [{ id: 1, text: 'Correct answer', isCorrect: true }, { id: 2, text: 'Another answer', isCorrect: false }] }] };
    this.submitting.set(true);
    const request = this.editingId() ? this.api.update(this.editingId() as number, draft) : this.api.create(this.courseId, draft);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.dialogOpen.set(false); this.errorMessage.set(''); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to save this assessment.')) });
  }

  protected deleteAssessment(): void {
    const id = this.editingId();
    if (id === null) return;
    this.submitting.set(true);
    this.api.remove(id).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.dialogOpen.set(false); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to delete this assessment.')) });
  }

  private publish(assessment: InstructorAssessmentRecord): void {
    this.submitting.set(true);
    this.api.publish(assessment.id).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.errorMessage.set(''); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to publish this assessment.')) });
  }

  private refreshConfig(): void {
    const assessments = this.assessments();
    const items: FeaturePageItem[] = assessments.map((assessment) => ({ id: assessment.id, title: assessment.title, subtitle: `Course ${assessment.courseId} · ${assessment.type}`, meta: `${assessment.questions.length} questions`, status: assessment.status, statusTone: assessment.status === 'Published' ? 'green' : assessment.status === 'Archived' ? 'gray' : 'orange', action: assessment.status === 'Draft' ? 'Publish assessment' : 'Edit assessment' }));
    this.config.update((config) => ({ ...config, loading: this.loading(), errorMessage: this.errorMessage(), items, stats: [{ label: 'Assessments', value: String(assessments.length), change: 'This course', tone: 'blue' }, { label: 'Questions', value: String(assessments.reduce((total, assessment) => total + assessment.questions.length, 0)), change: 'Across assessments', tone: 'green' }, { label: 'Draft', value: String(assessments.filter((assessment) => assessment.status === 'Draft').length), change: 'Needs completion', tone: 'orange' }, { label: 'Published', value: String(assessments.filter((assessment) => assessment.status === 'Published').length), change: 'Live for learners', tone: 'violet' }] }));
  }

  private message(error: { error?: { message?: string }; message?: string }, fallback: string): string { return error.error?.message ?? error.message ?? fallback; }
}

