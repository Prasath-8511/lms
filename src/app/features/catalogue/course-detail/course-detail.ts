import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseModule } from '../../../shared/models/lms.models';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-course-detail-page',
  standalone: true,
  imports: [DecimalPipe, RouterLink, IconComponent],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetailPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(LmsStoreService);
  protected readonly courseId = signal(101);
  protected readonly course = computed(() => this.store.getCourse(this.courseId()));
  protected readonly modules = computed(() => this.store.getModules(this.courseId()));
  protected readonly completedLessons = computed(() =>
    this.modules().reduce(
      (total, module) => total + module.lessons.filter((lesson) => lesson.completed).length,
      0,
    ),
  );

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isFinite(id)) {
        this.courseId.set(id);
      }
    });
  }

  protected completeLesson(lessonId: number): void {
    this.store.completeLesson(this.courseId(), lessonId);
  }

  protected completedInModule(module: CourseModule): number {
    return module.lessons.filter((lesson) => lesson.completed).length;
  }

  protected enrollOrContinue(enrolled: boolean): void {
    if (!enrolled) {
      this.store.enroll(this.courseId());
      return;
    }
    const firstLesson = this.modules()[0]?.lessons[0];
    if (firstLesson) {
      this.completeLesson(firstLesson.id);
    }
  }
}
