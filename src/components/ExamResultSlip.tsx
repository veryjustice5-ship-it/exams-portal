import React from 'react';
import { ExamSubmission, Exam } from '../types/exam';
import { ElgiLogo } from './ElgiLogo';
import {
  Award,
  CheckCircle2,
  XCircle,
  Printer,
  RotateCcw,
  ArrowLeft,
  Calendar,
  User,
  Hash,
  BookOpen,
  FileCheck2,
  Check,
  AlertTriangle
} from 'lucide-react';

interface ExamResultSlipProps {
  submission: ExamSubmission;
  exam?: Exam;
  onRetakeExam: () => void;
  onReturnToExamList: () => void;
  onViewGradebook: () => void;
}

export const ExamResultSlip: React.FC<ExamResultSlipProps> = ({
  submission,
  exam,
  onRetakeExam,
  onReturnToExamList,
  onViewGradebook,
}) => {
  const isPassed = submission.grade !== 'F';

  const getGradeTheme = (grade: string) => {
    switch (grade) {
      case 'A':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-600 text-white',
          remark: 'Distinction / Excellent Mastery',
        };
      case 'B':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-600 text-white',
          remark: 'Very Good / Commendable Merit',
        };
      case 'C':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-600 text-white',
          remark: 'Good / Satisfactory Credit',
        };
      case 'D':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-600 text-white',
          remark: 'Passing Grade',
        };
      default:
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-600 text-white',
          remark: 'Remedial Required / Below Threshold',
        };
    }
  };

  const theme = getGradeTheme(submission.grade);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Action Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onReturnToExamList}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Exam Room
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print / Save Grade Slip
            </button>
            <button
              type="button"
              onClick={onRetakeExam}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Retake Exam
            </button>
            <button
              type="button"
              onClick={onViewGradebook}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
              View ELGI Gradebook
            </button>
          </div>
        </div>

        {/* Official Grade Slip Printable Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Institution Header */}
          <div className="border-b-2 border-blue-950 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <ElgiLogo className="w-16 h-16" />
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest">
                  <span>Official Assessment Examination Report</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-600 font-bold">Faculty Administration</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {submission.quizTitle}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 font-mono">
                  Course Association: <strong className="text-blue-900">{submission.courseCode}</strong> — {submission.courseTitle}
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 shrink-0">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Verification Reference
              </span>
              <span className="text-xs font-mono font-semibold text-slate-700 block mt-0.5">
                {submission.id}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                {submission.timestamp}
              </span>
            </div>
          </div>

          {/* Core Grade Display Banner */}
          <div className={`rounded-xl border p-6 ${theme.bg} ${theme.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Big Letter Grade Pill */}
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm ${theme.badge}`}
                >
                  <span className="text-3xl leading-none">{submission.grade}</span>
                  <span className="text-[10px] uppercase tracking-wider mt-1 font-semibold opacity-90">
                    Grade
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Auto-Graded Result
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isPassed ? 'PASSED' : 'REMEDIAL REQUIRED'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{theme.remark}</h2>
                  <p className="text-xs text-slate-600 mt-1">{submission.feedback}</p>
                </div>
              </div>

              {/* Numerical Metrics */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-200/60 pt-4 sm:pt-0 font-mono">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Score Achieved
                  </span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {submission.score}{' '}
                    <span className="text-sm font-normal text-slate-500">
                      / {submission.maxScore} pts
                    </span>
                  </span>
                </div>
                <div className="text-right sm:mt-2">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Normalized Percentage
                  </span>
                  <span className="text-xl font-bold text-blue-900 tabular-nums">
                    {submission.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Record Mapping Matrix (Matching PDF Page 2 specification) */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Candidate & Portal Audit Record
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Candidate Full Name</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {submission.studentFullName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Entered Student ID</span>
                <span className="font-semibold font-mono text-slate-900 block mt-0.5">
                  {submission.studentId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Normalized Portal SID</span>
                <span className="font-semibold font-mono text-blue-900 block mt-0.5">
                  {submission.portalSid}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Attempt Number</span>
                <span className="font-semibold font-mono text-slate-900 block mt-0.5">
                  Attempt #{submission.attemptNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Course Identifier</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {submission.courseCode}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submission Timestamp</span>
                <span className="font-mono text-slate-700 block mt-0.5">
                  {submission.timestamp}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Portal Synchronization</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                  {submission.portalStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Audit Notes</span>
                <span className="text-slate-600 block mt-0.5 truncate">
                  {submission.notes || 'Normal submission'}
                </span>
              </div>
            </div>
          </div>

          {/* Question-by-Question Auto-Marking Breakdown */}
          {submission.answers && submission.answers.length > 0 && exam && (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Itemized Question Marking & Answer Key Review
                </h3>
                <span className="text-xs text-slate-500">
                  {submission.answers.filter((a) => a.isCorrect).length} Correct ·{' '}
                  {submission.answers.filter((a) => !a.isCorrect).length} Incorrect
                </span>
              </div>

              <div className="space-y-4">
                {submission.answers.map((answer) => {
                  const questionObj = exam.questions.find((q) => q.id === answer.questionId);
                  if (!questionObj) return null;

                  const studentOption =
                    answer.selectedOptionIndex !== null
                      ? questionObj.options[answer.selectedOptionIndex]
                      : null;
                  const correctOption = questionObj.options[questionObj.correctOptionIndex];

                  return (
                    <div
                      key={answer.questionId}
                      className={`p-4 rounded-xl border text-xs space-y-3 transition-colors ${
                        answer.isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-700 font-mono">
                            Q{answer.questionNumber}.
                          </span>
                          <span className="font-medium text-slate-900 text-sm">
                            {questionObj.questionText}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {answer.isCorrect ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              +{answer.pointsAwarded} pt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              0 pts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Options Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div
                          className={`p-2.5 rounded-lg border ${
                            answer.isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <span className="font-semibold block text-[10px] uppercase tracking-wider opacity-75">
                            Candidate's Response:
                          </span>
                          <span className="font-medium mt-0.5 block">
                            {studentOption
                              ? `Option ${studentOption.label}: ${studentOption.text}`
                              : 'No answer submitted (Skipped)'}
                          </span>
                        </div>

                        {!answer.isCorrect && (
                          <div className="p-2.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-900">
                            <span className="font-semibold block text-[10px] uppercase tracking-wider opacity-75">
                              Correct Answer Key:
                            </span>
                            <span className="font-medium mt-0.5 block">
                              Option {correctOption.label}: {correctOption.text}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Explanation Feedback from Question Key */}
                      {questionObj.feedback && (
                        <div className="bg-slate-100/70 p-2.5 rounded-lg text-slate-700 text-xs flex items-start gap-2">
                          <span className="font-semibold text-slate-900 shrink-0">Explanation:</span>
                          <span>{questionObj.feedback}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Official Sign-off and Disclaimer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Generated automatically by ELGI AutoGrade Assessment Engine.</p>
              <p className="mt-0.5">
                Institutional SID mapping: <span className="font-mono text-blue-900 font-bold">{submission.portalSid}</span> · ELGI Student Portal Integration Ready.
              </p>
            </div>
            <div className="text-right">
              <span className="block font-semibold text-blue-950">Official ELGI Examination Board</span>
              <span className="font-mono text-emerald-700 font-semibold">✓ RECORD VERIFIED & SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
