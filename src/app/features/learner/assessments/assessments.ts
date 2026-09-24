import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { Assessment } from '../../../shared/models/lms.models';
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
  protected readonly assessments = this.store.assessments;
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
}
