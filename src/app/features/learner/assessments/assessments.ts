import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { Assessment } from '../../../shared/models/lms.models';
import { AssessmentAttempt, AssessmentAttemptApiService } from '../data-access/assessment-attempt-api.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-assessments-page',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './assessments.html',
  styleUrl: './assessments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentsPage {
  protected readonly store = inject(LmsStoreService);
  private readonly router = inject(Router);
  private readonly attemptApi = inject(AssessmentAttemptApiService);
  protected readonly assessments = this.store.assessments;
  protected readonly isStarting = signal(false);
  protected readonly actionError = signal('');
  protected readonly selectedAssessment = signal<Assessment | null>(null);
  protected readonly completedCount = computed(
    () => this.assessments().filter((assessment) => assessment.status === 'Completed').length,
  );
  protected readonly activeCount = computed(
    () => this.assessments().filter((assessment) => assessment.status !== 'Completed').length,
  );

  protected openAssessment(assessment: Assessment): void {
    this.selectedAssessment.set(assessment);
  }

  protected closeAssessment(): void {
    this.selectedAssessment.set(null);
  }

  protected startAssessment(assessment: Assessment): void {
    if (this.isStarting()) return;
    this.isStarting.set(true);
    this.actionError.set('');
    this.attemptApi.start(assessment.id).pipe(finalize(() => this.isStarting.set(false))).subscribe({
      next: (attempt) => void this.router.navigate(['/attempts', attempt.id]),
      error: (error: { error?: { message?: string }; message?: string }) => this.actionError.set(error.error?.message ?? error.message ?? 'Unable to start this assessment.'),
    });
  }
}
