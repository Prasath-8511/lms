import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';
import { Course, CourseDraft, CourseLevel, CourseStatus } from '../../../shared/models/lms.models';
import { InstructorCourseApiService } from '../data-access/instructor-course-api.service';

@Component({
  selector: 'app-instructor-courses-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent],
  templateUrl: './instructor-courses.component.html',
  styleUrl: './instructor-courses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorCoursesPage {
  private readonly api = inject(InstructorCourseApiService);
  protected readonly courses = signal<Course[]>([]);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly dialogOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly formValue = signal<ResourceFormValue>({});
  protected readonly courseFields: ResourceField[] = [
    { key: 'title', label: 'Course title', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text', required: true },
    { key: 'level', label: 'Level', type: 'select', required: true, options: [{ label: 'Beginner', value: 'Beginner' }, { label: 'Intermediate', value: 'Intermediate' }, { label: 'Advanced', value: 'Advanced' }] },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'duration', label: 'Duration', type: 'text', required: true },
    { key: 'instructor', label: 'Instructor', type: 'text', required: true },
    { key: 'tags', label: 'Tags', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Draft', value: 'Draft' }, { label: 'Published', value: 'Published' }, { label: 'Archived', value: 'Archived' }] },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Instructor', title: 'My courses', description: 'Create, organize, and submit your learning content for review.', icon: 'book', primaryAction: 'Create course', secondaryAction: 'View analytics', secondaryRoute: '/instructor/reports', stats: [], items: [], loading: false, errorMessage: '', emptyMessage: 'You have not created any courses yet.',
  });

  constructor() { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.api.listOwned().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (courses) => { this.courses.set(courses); this.refreshConfig(); },
      error: (error: { error?: { message?: string }; message?: string }) => { this.errorMessage.set(this.message(error, 'Unable to load your courses.')); this.refreshConfig(); },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.formValue.set({ level: 'Beginner', status: 'Draft' });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected itemAction(item: FeaturePageItem): void {
    const course = this.courses().find((candidate) => candidate.id === item.id);
    if (!course) return;
    if (course.status === 'Draft' && item.action === 'Submit for review') { this.submitForReview(course); return; }
    this.editingId.set(course.id);
    this.formValue.set({ title: course.title, category: course.category, level: course.level, description: course.description, duration: course.duration, instructor: course.instructor, tags: course.tags.join(', '), status: course.status });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void { this.dialogOpen.set(false); this.errorMessage.set(''); }

  protected saveCourse(value: ResourceFormValue): void {
    const required = ['title', 'category', 'description', 'duration', 'instructor'];
    if (required.some((key) => !String(value[key] ?? '').trim())) { this.errorMessage.set('Complete all required course fields.'); return; }
    const draft: CourseDraft = { title: String(value['title']).trim(), category: String(value['category']).trim(), level: value['level'] as CourseLevel, description: String(value['description']).trim(), instructor: String(value['instructor']).trim(), duration: String(value['duration']).trim(), tags: String(value['tags'] ?? '').split(',').map((tag) => tag.trim()).filter(Boolean), status: value['status'] as CourseStatus };
    this.submitting.set(true);
    const request = this.editingId() ? this.api.update(this.editingId() as number, draft) : this.api.create(draft);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.dialogOpen.set(false); this.errorMessage.set(''); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to save this course.')) });
  }

  protected deleteCourse(): void {
    const id = this.editingId();
    if (id === null) return;
    this.submitting.set(true);
    this.api.delete(id).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.dialogOpen.set(false); this.errorMessage.set(''); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to delete this course.')) });
  }

  private submitForReview(course: Course): void {
    this.submitting.set(true);
    this.api.submitForReview(course.id).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.dialogOpen.set(false); this.errorMessage.set(''); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to submit this course.')) });
  }

  private refreshConfig(): void {
    const courses = this.courses();
    const items: FeaturePageItem[] = courses.map((course) => ({ id: course.id, title: course.title, subtitle: `Course · ${course.status}`, meta: course.status === 'Published' ? 'Live in catalog' : 'Not published', status: course.status, statusTone: course.status === 'Published' ? 'green' : course.status === 'Archived' ? 'gray' : 'orange', action: course.status === 'Draft' ? 'Submit for review' : 'Edit course' }));
    this.config.update((config) => ({ ...config, loading: this.loading(), errorMessage: this.errorMessage(), items, stats: [{ label: 'Owned courses', value: String(courses.length), change: 'Current catalog', tone: 'blue' }, { label: 'Published', value: String(courses.filter((course) => course.status === 'Published').length), change: 'Live courses', tone: 'green' }, { label: 'In review', value: String(courses.filter((course) => course.status === 'Draft').length), change: 'Action needed', tone: 'orange' }, { label: 'Learners', value: String(courses.filter((course) => course.status === 'Published').length * 86), change: 'Across published courses', tone: 'violet' }] }));
  }

  private message(error: { error?: { message?: string }; message?: string }, fallback: string): string { return error.error?.message ?? error.message ?? fallback; }
}

