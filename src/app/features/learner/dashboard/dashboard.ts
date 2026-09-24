import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly store = inject(LmsStoreService);
  protected readonly profile = this.store.profile;
  protected readonly stats = this.store.stats;
  protected readonly continueCourses = computed(() => this.store.inProgressCourses().slice(0, 3));
  protected readonly firstName = computed(
    () => this.profile().name.split(' ')[0] ?? this.profile().name,
  );
  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  });
  protected readonly nextAssessment = computed(() =>
    this.store.assessments().find((assessment) => assessment.status !== 'Completed'),
  );
}
