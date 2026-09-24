import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  protected readonly store = inject(LmsStoreService);
  protected readonly period = signal<'This month' | 'This quarter' | 'This year'>('This month');
  protected readonly periods: Array<'This month' | 'This quarter' | 'This year'> = [
    'This month',
    'This quarter',
    'This year',
  ];
  protected readonly completionRate = computed(() =>
    Math.round((this.store.stats().coursesCompleted / this.store.stats().coursesEnrolled) * 100),
  );
  protected readonly bars = [42, 57, 49, 71, 63, 82, 76, 91, 84, 96, 88, 100];
}
