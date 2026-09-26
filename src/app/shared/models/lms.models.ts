export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'Published' | 'Draft' | 'In review' | 'Archived';
export type AssessmentType = 'Quiz' | 'Assignment' | 'Project';
export type AssessmentStatus = 'Not started' | 'In progress' | 'Completed' | 'Due soon';

export interface Course {
  id: number;
  title: string;
  category: string;
  level: CourseLevel;
  description: string;
  instructor: string;
  duration: string;
  lessons: number;
  completedLessons: number;
  progress: number;
  rating: number;
  enrolled: boolean;
  icon: string;
  color: string;
  tags: string[];
  nextLesson: string;
  status: CourseStatus;
}

export interface InstructorAssessmentRecord {
  id: number;
  courseId: number;
  title: string;
  description: string;
  type: AssessmentType;
  status: 'Draft' | 'Published' | 'Archived';
  questions: AssessmentQuestionDraft[];
}

export interface LearningStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  certificationsEarned: number;
  learningHours: number;
  enrolledChange: string;
  completedChange: string;
  certificationChange: string;
  hoursChange: string;
}

export interface Assessment {
  id: number;
  course: string;
  title: string;
  type: AssessmentType;
  questions: number;
  duration: string;
  dueDate: string;
  status: AssessmentStatus;
  score?: number;
  progress: number;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issuedOn: string;
  credentialId: string;
  skills: string[];
  accent: string;
}

export interface Announcement {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: 'Learning' | 'Platform' | 'Community';
  pinned: boolean;
}

export interface ActivityItem {
  id: number;
  title: string;
  detail: string;
  time: string;
  icon: string;
  tone: string;
}

export interface Lesson {
  id: number;
  title: string;
  type: 'Video' | 'Reading' | 'Quiz' | 'Lab';
  duration: string;
  completed: boolean;
  current?: boolean;
}

export interface CourseModule {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface LearnerProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
  streak: number;
  totalHours: number;
  completedCourses: number;
  certificates: number;
}

export interface AssessmentResult {
  attemptId: number;
  score?: number;
  passed?: boolean;
  completedAt: string;
  message?: string;
}

export interface AssessmentQuestion {
  id: number;
  prompt: string;
  type: 'single-choice' | 'multiple-choice' | 'text';
  options: string[];
  marks: number;
}

export interface CourseDraft {
  title: string;
  category: string;
  level: CourseLevel;
  description: string;
  instructor: string;
  duration: string;
  tags: string[];
  status: CourseStatus;
}

export interface CourseModuleDraft {
  title: string;
  position: number;
}

export interface LessonDraft {
  title: string;
  type: Lesson['type'];
  duration: string;
  position: number;
}

export interface AnswerOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface AssessmentQuestionDraft {
  prompt: string;
  type: 'single-choice' | 'multiple-choice' | 'text';
  marks: number;
  options: AnswerOption[];
}

export interface AssessmentDraft {
  title: string;
  description: string;
  courseId: number;
  type: AssessmentType;
  status: 'Draft' | 'Published' | 'Archived';
  questions: AssessmentQuestionDraft[];
}

export interface GradingSubmission {
  id: number;
  assignmentId: number;
  courseId: number;
  learnerName: string;
  submission: string;
  submittedAt: string;
  status: 'Pending' | 'Graded';
  score?: number;
  feedback?: string;
}

export interface AnnouncementDraft {
  title: string;
  excerpt: string;
  category: Announcement['category'];
  author: string;
  published: boolean;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}
