import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import {
  AssessmentDraft,
  AssessmentQuestionDraft,
  InstructorAssessmentRecord,
} from '../../../shared/models/lms.models';

const MOCK_ASSESSMENTS: InstructorAssessmentRecord[] = [
  { id: 501, courseId: 101, title: 'Components, signals, and change detection', description: 'Check the core Angular concepts in this course.', type: 'Quiz', status: 'Published', questions: [
    { prompt: 'Which API creates a reactive value?', type: 'single-choice', marks: 5, options: [{ id: 1, text: 'signal()', isCorrect: true }, { id: 2, text: 'computed()', isCorrect: false }] },
    { prompt: 'Which features are true for signals?', type: 'multiple-choice', marks: 5, options: [{ id: 3, text: 'They are reactive.', isCorrect: true }, { id: 4, text: 'They require a zone task.', isCorrect: false }] },
  ] },
  { id: 502, courseId: 102, title: 'TestNG framework checkpoint', description: 'Validate your TestNG configuration knowledge.', type: 'Quiz', status: 'Draft', questions: [
    { prompt: 'Which annotation runs a test before the class?', type: 'single-choice', marks: 5, options: [{ id: 1, text: '@BeforeClass', isCorrect: true }, { id: 2, text: '@AfterClass', isCorrect: false }] },
  ] },
  { id: 503, courseId: 103, title: 'End-to-end test design review', description: 'Apply your end-to-end testing judgment.', type: 'Project', status: 'Published', questions: [
    { prompt: 'Describe the most important parts of a stable end-to-end test.', type: 'text', marks: 10, options: [] },
  ] },
];

@Injectable({ providedIn: 'root' })
export class AssessmentAuthoringApiService {
  private readonly api = inject(ApiClientService);
  private readonly mockAssessments = [...MOCK_ASSESSMENTS];

  list(courseId: number): Observable<InstructorAssessmentRecord[]> {
    return environment.useMocks
      ? of(this.mockAssessments.filter((assessment) => assessment.courseId === courseId))
      : this.api.get<InstructorAssessmentRecord[]>(`/instructor/courses/${courseId}/assessments`);
  }

  create(courseId: number, assessment: AssessmentDraft): Observable<InstructorAssessmentRecord> {
    if (!environment.useMocks) return this.api.post<InstructorAssessmentRecord>(`/instructor/courses/${courseId}/assessments`, assessment);
    const created: InstructorAssessmentRecord = { ...assessment, id: this.nextId(), courseId };
    this.mockAssessments.push(created);
    return of(created);
  }

  update(assessmentId: number, assessment: AssessmentDraft): Observable<InstructorAssessmentRecord> {
    if (!environment.useMocks) return this.api.put<InstructorAssessmentRecord>(`/instructor/assessments/${assessmentId}`, assessment);
    const index = this.mockAssessments.findIndex((item) => item.id === assessmentId);
    if (index < 0) throw new Error('Assessment not found');
    this.mockAssessments[index] = { ...this.mockAssessments[index], ...assessment };
    return of(this.mockAssessments[index]);
  }

  remove(assessmentId: number): Observable<void> {
    if (!environment.useMocks) return this.api.delete<void>(`/instructor/assessments/${assessmentId}`);
    this.mockAssessments.splice(this.mockAssessments.findIndex((item) => item.id === assessmentId), 1);
    return of(undefined);
  }

  publish(assessmentId: number): Observable<InstructorAssessmentRecord> {
    if (!environment.useMocks) return this.api.post<InstructorAssessmentRecord>(`/instructor/assessments/${assessmentId}/publish`, {});
    const index = this.mockAssessments.findIndex((item) => item.id === assessmentId);
    if (index < 0) throw new Error('Assessment not found');
    this.mockAssessments[index] = { ...this.mockAssessments[index], status: 'Published' };
    return of(this.mockAssessments[index]);
  }

  private nextId(): number { return Math.max(...this.mockAssessments.map((item) => item.id), 500) + 1; }
}
