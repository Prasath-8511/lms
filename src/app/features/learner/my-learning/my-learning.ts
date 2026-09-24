import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-my-learning-page',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './my-learning.html',
  styleUrl: './my-learning.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLearningPage {
  protected readonly store = inject(LmsStoreService);
  protected readonly activeFilter = signal<'All' | 'In progress' | 'Completed'>('All');
  protected readonly filters: Array<'All' | 'In progress' | 'Completed'> = [
    'All',
    'In progress',
    'Completed',
  ];
  protected readonly visibleCourses = computed(() => {
    const filter = this.activeFilter();
    return this.store
      .enrolledCourses()
      .filter(
        (course) =>
          filter === 'All' ||
          (filter === 'Completed'
            ? course.progress === 100
            : course.progress > 0 && course.progress < 100),
      );
  });
  protected readonly averageProgress = computed(() => {
    const courses = this.store.enrolledCourses();
    return courses.length
      ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length)
      : 0;
  });
}
