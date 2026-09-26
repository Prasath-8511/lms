import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AssessmentAttempt, AssessmentAttemptApiService } from '../data-access/assessment-attempt-api.service';
import { AssessmentQuestion, AssessmentResult } from '../../../shared/models/lms.models';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-assessment-attempts-page',
  standalone: true,
  imports: [FormsModule, RouterLink, FeaturePageComponent, IconComponent],
  templateUrl: './attempts.component.html',
  styleUrl: './attempts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentAttemptsPage {
  private readonly api = inject(AssessmentAttemptApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly isListMode = signal(true);
  protected readonly listConfig = signal<FeaturePageConfig>({
    eyebrow: 'Learner', title: 'Assessment attempts', description: 'Start, submit, and review your assessment attempts in one place.', icon: 'clipboard', primaryAction: 'Start an assessment', primaryRoute: '/assessments', secondaryAction: 'View assessments', secondaryRoute: '/assessments', stats: [], items: [], emptyMessage: 'No assessment attempts are available yet.',
  });
  protected readonly attempt = signal<AssessmentAttempt | null>(null);
  protected readonly currentIndex = signal(0);
  protected readonly answers = signal<Record<number, string | string[]>>({});
  protected readonly result = signal<AssessmentResult | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly loading = signal(true);
  protected readonly savingAnswer = signal(false);
  protected readonly submitting = signal(false);
  protected readonly questions = computed(() => this.attempt()?.questions ?? []);
  protected readonly currentQuestion = computed<AssessmentQuestion | null>(() => this.questions()[this.currentIndex()] ?? null);
  protected readonly isLastQuestion = computed(() => this.currentIndex() === this.questions().length - 1);
  protected readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  protected readonly isExpired = computed(() => {
    const expiresAt = this.attempt()?.expiresAt;
    return !!expiresAt && new Date(expiresAt).getTime() <= Date.now();
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const rawId = params.get('attemptId');
      const id = Number(rawId);
      if (rawId !== null && Number.isFinite(id) && id > 0) {
        this.isListMode.set(false);
        this.loadAttempt(id);
      } else {
        this.isListMode.set(true);
        this.loadAttempts();
      }
    });
  }

  protected loadAttempts(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.api.list().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (attempts) => {
        const items: FeaturePageItem[] = attempts.map((attempt) => ({
          id: attempt.id,
          title: attempt.assessmentTitle ?? `Assessment ${attempt.assessmentId}`,
          subtitle: attempt.courseTitle ?? 'Assessment attempt',
          meta: attempt.score === undefined ? `Started ${attempt.startedAt}` : `Score ${attempt.score}%`,
          status: attempt.status,
          statusTone: attempt.status === 'Graded' ? 'green' : attempt.status === 'In progress' ? 'orange' : 'gray',
          action: attempt.status === 'In progress' ? 'Continue attempt' : 'View result',
        }));
        this.listConfig.update((config) => ({
          ...config,
          stats: [
            { label: 'Total attempts', value: String(attempts.length), change: 'Across your assessments', tone: 'blue' },
            { label: 'In progress', value: String(attempts.filter((attempt) => attempt.status === 'In progress').length), change: 'Ready to finish', tone: 'orange' },
            { label: 'Submitted', value: String(attempts.filter((attempt) => attempt.status === 'Submitted' || attempt.status === 'Graded').length), change: 'Awaiting or graded', tone: 'violet' },
            { label: 'Average score', value: `${Math.round(attempts.filter((attempt) => attempt.score !== undefined).reduce((total, attempt) => total + (attempt.score ?? 0), 0) / Math.max(1, attempts.filter((attempt) => attempt.score !== undefined).length))}%`, change: 'Across graded attempts', tone: 'green' },
          ],
          items,
        }));
      },
      error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(error.error?.message ?? error.message ?? 'Unable to load assessment attempts.'),
    });
  }

  protected openAttempt(item: FeaturePageItem): void {
    if (item.id) void this.router.navigate(['/attempts', item.id]);
  }

  protected loadAttempt(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.api.get(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (attempt) => {
        this.attempt.set(attempt);
        this.answers.set({ ...(attempt.answers ?? {}) });
        this.result.set(attempt.result ?? null);
        this.currentIndex.set(0);
      },
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.errorMessage.set(error.error?.message ?? error.message ?? 'Unable to load this assessment attempt.');
      },
    });
  }

  protected answerValue(): string | string[] {
    const question = this.currentQuestion();
    return question ? (this.answers()[question.id] ?? '') : '';
  }

  protected textAnswer(): string {
    const value = this.answerValue();
    return typeof value === 'string' ? value : value.join(', ');
  }

  protected setAnswer(value: string | string[]): void {
    const question = this.currentQuestion();
    if (question) this.answers.update((answers) => ({ ...answers, [question.id]: value }));
  }

  protected toggleOption(option: string): void {
    const question = this.currentQuestion();
    if (!question) return;
    const current = Array.isArray(this.answerValue()) ? [...(this.answerValue() as string[])] : [];
    this.setAnswer(current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  protected isSelected(option: string): boolean {
    const answer = this.answerValue();
    return Array.isArray(answer) ? answer.includes(option) : answer === option;
  }

  protected saveAnswer(): void {
    const attempt = this.attempt();
    const question = this.currentQuestion();
    if (!attempt || !question || this.savingAnswer() || this.isExpired()) return;
    this.savingAnswer.set(true);
    this.api.saveAnswer(attempt.id, question.id, this.answerValue()).pipe(finalize(() => this.savingAnswer.set(false))).subscribe({
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.errorMessage.set(error.error?.message ?? error.message ?? 'Unable to save this answer.');
      },
    });
  }

  protected next(): void {
    this.saveAnswer();
    if (!this.isLastQuestion()) this.currentIndex.update((index) => index + 1);
  }

  protected previous(): void {
    if (this.currentIndex() > 0) this.currentIndex.update((index) => index - 1);
  }

  protected submit(): void {
    const attempt = this.attempt();
    if (!attempt || this.submitting() || this.result() || this.isExpired()) return;
    if (this.answeredCount() < this.questions().length) {
      this.errorMessage.set('Answer every question before submitting.');
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set('');
    this.api.submit(attempt.id, this.answers()).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (result) => this.result.set(result),
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.errorMessage.set(error.error?.message ?? error.message ?? 'Unable to submit this assessment.');
      },
    });
  }

  protected back(): void {
    void this.router.navigateByUrl('/attempts');
  }
}
