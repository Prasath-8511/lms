import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesPage {
  protected readonly store = inject(LmsStoreService);
  private readonly route = inject(ActivatedRoute);
  protected readonly enrollmentInProgress = signal<number | null>(null);
  protected readonly enrollmentError = signal('');
  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal('All courses');
  protected readonly categories = [
    'All courses',
    'Development',
    'Testing',
    'Automation',
    'Backend',
    'Data & Analytics',
    'Design',
  ];
  protected readonly filteredCourses = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    return this.store.courses().filter((course) => {
      const matchesCategory = category === 'All courses' || course.category === category;
      const matchesQuery =
        !query ||
        [course.title, course.description, course.category, ...course.tags]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesQuery;
    });
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const query = params.get('q');
      if (query !== null) {
        this.searchTerm.set(query);
      }
    });
  }

  protected setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  protected enrollCourse(courseId: number): void {
    if (this.enrollmentInProgress() !== null) return;
    this.enrollmentInProgress.set(courseId);
    this.enrollmentError.set('');
    this.store.enroll(courseId).subscribe({
      next: () => this.enrollmentInProgress.set(null),
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.enrollmentInProgress.set(null);
        this.enrollmentError.set(error.error?.message ?? error.message ?? 'Unable to enroll in this course.');
      },
    });
  }
}
