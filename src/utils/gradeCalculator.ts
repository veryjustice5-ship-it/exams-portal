import { GradingPolicy, ExamSubmission, Question } from '../types/exam';

/**
 * Derives normalized portal student key (sid) from raw Student ID
 * Formula per PDF specifications (Page 3):
 * "derived from the Student ID by uppercasing and replacing non-alphanumeric characters with underscores.
 *  For example: EGI/2024/02486 -> EGI_2024_02486"
 */
export function normalizeStudentId(rawId: string): string {
  if (!rawId) return '';
  return rawId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Suggested official percentage-to-grade rule from PDF Page 3:
 * 70-100: A
 * 60-69: B
 * 50-59: C
 * 45-49: D
 * 0-44: F
 */
export const DEFAULT_GRADING_POLICY: GradingPolicy = {
  id: 'standard_institutional',
  name: 'Institutional Policy (PDF Standard)',
  description: 'Official scale: 70-100 (A), 60-69 (B), 50-59 (C), 45-49 (D), 0-44 (F)',
  rules: [
    { grade: 'A', minPercentage: 70, maxPercentage: 100, label: 'Excellent / Distinction', badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { grade: 'B', minPercentage: 60, maxPercentage: 69.99, label: 'Very Good / Merit', badgeColor: 'text-blue-700 bg-blue-50 border-blue-200' },
    { grade: 'C', minPercentage: 50, maxPercentage: 59.99, label: 'Good / Credit', badgeColor: 'text-amber-700 bg-amber-50 border-amber-200' },
    { grade: 'D', minPercentage: 45, maxPercentage: 49.99, label: 'Pass', badgeColor: 'text-orange-700 bg-orange-50 border-orange-200' },
    { grade: 'F', minPercentage: 0, maxPercentage: 44.99, label: 'Fail / Remedial', badgeColor: 'text-rose-700 bg-rose-50 border-rose-200' },
  ],
};

export function calculateGrade(percentage: number, policy: GradingPolicy = DEFAULT_GRADING_POLICY): {
  grade: string;
  label: string;
  badgeColor: string;
} {
  const rounded = Math.round(percentage * 10) / 10;
  for (const rule of policy.rules) {
    if (rounded >= rule.minPercentage && rounded <= (rule.maxPercentage === 100 ? 100 : rule.maxPercentage + 0.01)) {
      return { grade: rule.grade, label: rule.label, badgeColor: rule.badgeColor };
    }
  }
  // Fallback
  return { grade: 'F', label: 'Fail / Remedial', badgeColor: 'text-rose-700 bg-rose-50 border-rose-200' };
}

export function formatCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/**
 * Generates CSV string for Portal_Results workbook export
 * Matches exact format specified in PDF Page 2 & Page 3
 */
export function exportPortalResultsToCSV(submissions: ExamSubmission[]): string {
  const headers = [
    'Timestamp',
    'Student ID',
    'Portal Student SID',
    'Student Full Name',
    'Course Code',
    'Course Title',
    'Quiz Title',
    'Score',
    'Max Score',
    'Percentage',
    'Grade',
    'Attempt Number',
    'Feedback',
    'Portal Status',
    'Portal Updated At',
    'Notes',
  ];

  const escapeCSV = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = submissions.map((sub) => [
    escapeCSV(sub.timestamp),
    escapeCSV(sub.studentId),
    escapeCSV(sub.portalSid),
    escapeCSV(sub.studentFullName),
    escapeCSV(sub.courseCode),
    escapeCSV(sub.courseTitle),
    escapeCSV(sub.quizTitle),
    sub.score,
    sub.maxScore,
    escapeCSV(`${sub.percentage.toFixed(1)}%`),
    escapeCSV(sub.grade),
    sub.attemptNumber,
    escapeCSV(sub.feedback),
    escapeCSV(sub.portalStatus),
    escapeCSV(sub.portalUpdatedAt),
    escapeCSV(sub.notes),
  ].join(','));

  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
}

/**
 * Generates CSV string for Question_Key planning table export
 * Matches format specified in PDF Page 3
 */
export function exportQuestionKeyToCSV(questions: Question[]): string {
  const headers = [
    'Question #',
    'Question Text',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Answer Key',
    'Points',
    'Explanation / Feedback',
  ];

  const escapeCSV = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = questions.map((q) => {
    const optA = q.options.find(o => o.label === 'A')?.text || '';
    const optB = q.options.find(o => o.label === 'B')?.text || '';
    const optC = q.options.find(o => o.label === 'C')?.text || '';
    const optD = q.options.find(o => o.label === 'D')?.text || '';
    const correctLetter = ['A', 'B', 'C', 'D'][q.correctOptionIndex] || 'A';

    return [
      q.number,
      escapeCSV(q.questionText),
      escapeCSV(optA),
      escapeCSV(optB),
      escapeCSV(optC),
      escapeCSV(optD),
      escapeCSV(correctLetter),
      q.points,
      escapeCSV(q.feedback),
    ].join(',');
  });

  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
}

export function triggerDownload(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
