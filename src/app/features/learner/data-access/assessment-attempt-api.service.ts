import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { environment } from '../../../../environments/environment';
import { MOCK_ASSESSMENT_ATTEMPTS, MOCK_ASSESSMENTS } from '../../../core/data/mock-data';
import {
  Assessment,
  AssessmentQuestion,
  AssessmentResult,
} from '../../../shared/models/lms.models';

export interface AssessmentAttempt {
  id: number;
  assessmentId: number;
  status: 'Not started' | 'In progress' | 'Submitted' | 'Graded';
  score?: number;
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  questions?: AssessmentQuestion[];
  answers?: Record<number, string | string[]>;
  result?: AssessmentResult;
  assessmentTitle?: string;
  courseTitle?: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentAttemptApiService {
  private readonly attemptStore = new Map<number, AssessmentAttempt>();
  private readonly api = inject(ApiClientService);

  list(): Observable<AssessmentAttempt[]> {
    if (environment.useMocks) {
      return of(
        [...this.attemptStore.values()].length
          ? [...this.attemptStore.values()]
          : MOCK_ASSESSMENT_ATTEMPTS,
      );
    }
    return this.api.get<AssessmentAttempt[]>('/learner/assessment-attempts');
  }

  start(assessmentId: number): Observable<AssessmentAttempt> {
    if (!environment.useMocks) {
      return this.api
        .post<AssessmentAttempt>(`/assessments/${assessmentId}/attempts`, {})
        .pipe(tap((attempt) => this.attemptStore.set(attempt.id, attempt)));
    }
    const existing = [...this.attemptStore.values()].find(
      (attempt) => attempt.assessmentId === assessmentId && attempt.status === 'In progress',
    ) ?? MOCK_ASSESSMENT_ATTEMPTS.find((attempt) => attempt.assessmentId === assessmentId);
    const attempt: AssessmentAttempt = {
      id: existing?.id ?? assessmentId + 700,
      assessmentId,
      status: 'In progress',
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      questions: this.mockQuestions(assessmentId),
      answers: (existing as AssessmentAttempt | undefined)?.answers ?? {},
    };
    this.attemptStore.set(attempt.id, attempt);
    return of(attempt);
  }

  saveAnswer(attemptId: number, questionId: number, answer: string | string[]): Observable<void> {
    if (!environment.useMocks) {
      return this.api.put<void>(
        `/learner/assessment-attempts/${attemptId}/answers/${questionId}`,
        { answer },
      );
    }
    const attempt = this.attemptStore.get(attemptId);
    if (attempt) {
      this.attemptStore.set(attemptId, {
        ...attempt,
        answers: { ...(attempt.answers ?? {}), [questionId]: answer },
      });
    }
    return of(undefined);
  }

  submit(attemptId: number, answers: Record<number, string | string[]>): Observable<AssessmentResult> {
    if (!environment.useMocks) {
      return this.api.post<AssessmentResult>(
        `/learner/assessment-attempts/${attemptId}/submit`,
        { answers },
      );
    }
    const result: AssessmentResult = {
      attemptId,
      score: 88,
      passed: true,
      completedAt: new Date().toISOString(),
      message: 'Assessment submitted successfully.',
    };
    const attempt = this.attemptStore.get(attemptId);
    if (attempt) {
      this.attemptStore.set(attemptId, {
        ...attempt,
        status: 'Graded',
        answers,
        result,
        submittedAt: result.completedAt,
        score: result.score,
      });
    }
    return of(result);
  }

  get(attemptId: number): Observable<AssessmentAttempt> {
    if (!environment.useMocks) {
      return this.api.get<AssessmentAttempt>(`/learner/assessment-attempts/${attemptId}`);
    }
    const attempt = this.attemptStore.get(attemptId) ?? MOCK_ASSESSMENT_ATTEMPTS.find((item) => item.id === attemptId);
    const resolved: AssessmentAttempt = {
      ...(attempt ?? {
        id: attemptId,
        assessmentId: 201,
        status: 'In progress' as const,
        startedAt: new Date().toISOString(),
      }),
      questions: this.mockQuestions(attempt?.assessmentId ?? 201),
    };
    this.attemptStore.set(resolved.id, resolved);
    return of(resolved);
  }

  getAssessment(assessmentId: number): Observable<Assessment> {
    if (!environment.useMocks) {
      return this.api.get<Assessment>(`/assessments/${assessmentId}`);
    }
    const assessment = MOCK_ASSESSMENTS.find((item) => item.id === assessmentId);
    return assessment ? of(assessment) : this.api.get<Assessment>(`/assessments/${assessmentId}`);
  }

  private mockQuestions(assessmentId: number): AssessmentQuestion[] {
    const title = MOCK_ASSESSMENTS.find((item) => item.id === assessmentId)?.title ?? 'Course assessment';
    return [
      { id: assessmentId * 10 + 1, prompt: `Which best describes ${title}?`, type: 'single-choice', options: ['The first option', 'The second option', 'The third option', 'The fourth option'], marks: 5 },
      { id: assessmentId * 10 + 2, prompt: 'Which statements apply to this workflow?', type: 'multiple-choice', options: ['Validate input', 'Handle API errors', 'Ignore loading states', 'Prevent duplicate submits'], marks: 5 },
    ];
  }
}
