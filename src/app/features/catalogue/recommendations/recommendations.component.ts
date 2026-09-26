import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CourseCatalogApiService } from '../data-access/course-catalog-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { Course } from '../../../shared/models/lms.models';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsPage {
  private readonly api = inject(CourseCatalogApiService);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Catalogue',
    title: 'Recommended for you',
    description: 'Continue growing with learning selected from your goals and activity.',
    icon: 'sparkles',
    primaryAction: 'Browse all courses',
    primaryRoute: '/courses',
    secondaryAction: 'Refresh recommendations',
    stats: [],
    items: [],
    loading: true,
    errorMessage: '',
    emptyMessage: 'No recommendations are available right now.',
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .getRecommendations()
      .pipe(finalize(() => this.patch({ loading: false })))
      .subscribe({
        next: (courses) => this.apply(courses),
        error: (error: { error?: { message?: string }; message?: string }) =>
          this.patch({ errorMessage: error.error?.message ?? error.message ?? 'Unable to load recommendations.' }),
      });
  }

  private apply(courses: Course[]): void {
    const items: FeaturePageItem[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      subtitle: course.category,
      meta: `${course.level} · ${course.rating} rating`,
      status: course.enrolled ? 'Enrolled' : 'Recommended',
      statusTone: course.enrolled ? 'green' : 'blue',
      action: 'View course',
      route: `/courses/${course.id}`,
    }));
    this.patch({
      errorMessage: '',
      items,
      stats: [
        { label: 'Recommended', value: String(courses.length), change: 'Based on your goals', tone: 'blue' },
        { label: 'Already enrolled', value: String(courses.filter((course) => course.enrolled).length), change: 'In progress', tone: 'green' },
        { label: 'Categories', value: String(new Set(courses.map((course) => course.category)).size), change: 'Areas of interest', tone: 'violet' },
        { label: 'Skill tags', value: String(new Set(courses.flatMap((course) => course.tags)).size), change: 'Matched to you', tone: 'orange' },
      ],
    });
  }

  private patch(partial: Partial<FeaturePageConfig>): void {
    this.config.update((config) => ({ ...config, ...partial }));
  }
}
