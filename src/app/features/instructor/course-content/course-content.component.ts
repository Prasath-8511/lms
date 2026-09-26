import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { CourseContentApiService } from '../data-access/course-content-api.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { ResourceFormDialogComponent } from '../../../shared/components/resource-form-dialog/resource-form-dialog.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { ResourceField, ResourceFormValue } from '../../../shared/models/resource-form.models';
import { CourseModule } from '../../../shared/models/lms.models';

@Component({
  selector: 'app-course-content-page',
  standalone: true,
  imports: [FeaturePageComponent, ResourceFormDialogComponent, IconComponent],
  templateUrl: './course-content.component.html',
  styleUrl: './course-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseContentPage {
  private readonly api = inject(CourseContentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly courseId = Number(this.route.snapshot.paramMap.get('id') ?? 101);
  protected readonly modules = signal<CourseModule[]>([]);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly dialogOpen = signal(false);
  protected readonly dialogMode = signal<'module' | 'lesson'>('module');
  protected readonly editingModuleId = signal<number | null>(null);
  protected readonly editingLessonId = signal<number | null>(null);
  protected readonly formValue = signal<ResourceFormValue>({});
  protected readonly moduleFields: ResourceField[] = [
    { key: 'title', label: 'Module title', type: 'text', required: true },
    { key: 'position', label: 'Position', type: 'number', required: true, min: 1 },
  ];
  protected readonly lessonFields: ResourceField[] = [
    { key: 'title', label: 'Lesson title', type: 'text', required: true },
    { key: 'type', label: 'Lesson type', type: 'select', required: true, options: [{ label: 'Video', value: 'Video' }, { label: 'Reading', value: 'Reading' }, { label: 'Quiz', value: 'Quiz' }, { label: 'Lab', value: 'Lab' }] },
    { key: 'duration', label: 'Duration', type: 'text', required: true },
    { key: 'position', label: 'Position', type: 'number', required: true, min: 1 },
  ];
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Instructor', title: 'Course content', description: 'Shape modules and lessons into a clear, engaging learning journey.', icon: 'book', primaryAction: 'Add module', secondaryAction: 'Publish course', stats: [], items: [], loading: false, errorMessage: '', emptyMessage: 'No modules have been added to this course.',
  });

  constructor() { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.api.getModules(this.courseId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (modules) => { this.modules.set(modules); this.refreshConfig(); },
      error: (error: { error?: { message?: string }; message?: string }) => { this.errorMessage.set(this.message(error, 'Unable to load course content.')); this.refreshConfig(); },
    });
  }

  protected openAddModule(): void {
    this.dialogMode.set('module');
    this.editingModuleId.set(null);
    this.editingLessonId.set(null);
    this.formValue.set({ position: this.modules().length + 1 });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected openAddLesson(module: CourseModule): void {
    this.dialogMode.set('lesson');
    this.editingModuleId.set(module.id);
    this.editingLessonId.set(null);
    this.formValue.set({ type: 'Video', position: module.lessons.length + 1 });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected openEditLesson(module: CourseModule, lesson: CourseModule['lessons'][number]): void {
    this.dialogMode.set('lesson');
    this.editingModuleId.set(module.id);
    this.editingLessonId.set(lesson.id);
    this.formValue.set({ title: lesson.title, type: lesson.type, duration: lesson.duration, position: module.lessons.indexOf(lesson) + 1 });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected deleteLesson(lessonId: number): void {
    this.submitting.set(true);
    this.api.deleteLesson(this.courseId, lessonId).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.errorMessage.set(''); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to delete this lesson.')) });
  }

  protected itemAction(item: FeaturePageItem): void {
    const module = this.modules().find((candidate) => candidate.id === item.id);
    if (!module) return;
    this.dialogMode.set('module');
    this.editingModuleId.set(module.id);
    this.editingLessonId.set(null);
    this.formValue.set({ title: module.title, position: this.modules().indexOf(module) + 1 });
    this.errorMessage.set('');
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void { this.dialogOpen.set(false); this.errorMessage.set(''); }

  protected save(value: ResourceFormValue): void {
    const title = String(value['title'] ?? '').trim();
    if (!title) { this.errorMessage.set('A title is required.'); return; }
    this.submitting.set(true);
    const request = this.dialogMode() === 'module' ? this.saveModule(value) : this.saveLesson(value);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.dialogOpen.set(false); this.errorMessage.set(''); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to save course content.')) });
  }

  protected deleteSelected(): void {
    const moduleId = this.editingModuleId();
    if (this.dialogMode() === 'module' && moduleId !== null) {
      this.submitting.set(true);
      this.api.deleteModule(this.courseId, moduleId).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.dialogOpen.set(false); this.load(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to delete this module.')) });
    }
  }

  protected publish(): void {
    this.submitting.set(true);
    this.api.publish(this.courseId).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.errorMessage.set(''); this.refreshConfig(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to publish this course.')) });
  }

  protected moveModule(module: CourseModule, direction: -1 | 1): void {
    const modules = [...this.modules()];
    const index = modules.findIndex((item) => item.id === module.id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= modules.length) return;
    [modules[index], modules[nextIndex]] = [modules[nextIndex], modules[index]];
    this.api.reorderModules(this.courseId, modules.map((item) => item.id)).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => { this.modules.set(modules); this.refreshConfig(); }, error: (error: { error?: { message?: string }; message?: string }) => this.errorMessage.set(this.message(error, 'Unable to reorder modules.')) });
  }

  private saveModule(value: ResourceFormValue): Observable<unknown> {
    const moduleId = this.editingModuleId();
    const draft = { title: String(value['title']).trim(), position: Number(value['position'] ?? 1) };
    return moduleId === null ? this.api.addModule(this.courseId, draft) : this.api.updateModule(this.courseId, moduleId, draft);
  }

  private saveLesson(value: ResourceFormValue): Observable<unknown> {
    const moduleId = this.editingModuleId();
    if (moduleId === null) return this.api.addModule(this.courseId, { title: 'Temporary module', position: this.modules().length + 1 });
    const lesson = { title: String(value['title']).trim(), type: value['type'] as 'Video' | 'Reading' | 'Quiz' | 'Lab', duration: String(value['duration']).trim(), position: Number(value['position'] ?? 1) };
    return this.editingLessonId() === null ? this.api.addLesson(this.courseId, moduleId, lesson) : this.api.updateLesson(this.courseId, this.editingLessonId() as number, lesson);
  }

  private refreshConfig(): void {
    const modules = this.modules();
    const items: FeaturePageItem[] = modules.map((module, index) => ({ id: module.id, title: module.title, subtitle: `Module ${index + 1} · ${module.lessons.length} lessons`, meta: module.lessons.length ? 'Has lesson content' : 'No lessons yet', status: module.lessons.length ? 'Ready' : 'Draft', statusTone: module.lessons.length ? 'green' : 'orange', action: 'Edit module' }));
    this.config.update((config) => ({ ...config, loading: this.loading(), errorMessage: this.errorMessage(), items, stats: [{ label: 'Modules', value: String(modules.length), change: 'Current course', tone: 'blue' }, { label: 'Lessons', value: String(modules.reduce((total, module) => total + module.lessons.length, 0)), change: 'Across modules', tone: 'green' }, { label: 'Draft content', value: String(modules.filter((module) => !module.lessons.length).length), change: 'Needs content', tone: 'orange' }, { label: 'Published', value: '—', change: 'Publish from this page', tone: 'violet' }] }));
  }

  private message(error: { error?: { message?: string }; message?: string }, fallback: string): string { return error.error?.message ?? error.message ?? fallback; }
}

