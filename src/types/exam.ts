export interface QuestionOption {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Question {
  id: string;
  number: number;
  questionText: string;
  options: QuestionOption[];
  correctOptionIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  points: number;
  feedback: string; // System/Teacher explanation for this question
  topic?: string;
}

export interface Exam {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  description: string;
  timeLimitMinutes: number; // 0 for unlimited
  questions: Question[];
  releaseGradesImmediately: boolean; // From PDF: "Release grades immediately only if answer key is final"
  allowRepeatAttempts: boolean; // From PDF: "Keep one submission per attempt unless repeat attempts are allowed"
  maxAttempts: number;
  totalPoints: number;
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  questionNumber: number;
  selectedOptionIndex: number | null; // null if skipped
  isCorrect: boolean;
  pointsAwarded: number;
  maxPoints: number;
}

export type PortalStatus = 'Pending' | 'Sent' | 'Updated' | 'Error';

export interface ExamSubmission {
  id: string;
  timestamp: string; // e.g. "2026-10-11 14:32:00"
  studentId: string; // e.g. "EGI/2024/02486"
  portalSid: string; // Normalized key e.g. "EGI_2024_02486"
  studentFullName: string;
  courseCode: string;
  courseTitle: string;
  quizTitle: string;
  examId: string;
  score: number;
  maxScore: number;
  percentage: number; // 0 - 100
  grade: string; // 'A' | 'B' | 'C' | 'D' | 'F'
  attemptNumber: number;
  feedback: string;
  portalStatus: PortalStatus;
  portalUpdatedAt: string;
  notes: string;
  answers: StudentAnswer[];
}

export interface GradeRule {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  label: string;
  badgeColor: string;
}

export interface GradingPolicy {
  id: string;
  name: string;
  description: string;
  rules: GradeRule[];
}
