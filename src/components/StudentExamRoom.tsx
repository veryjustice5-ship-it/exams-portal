import React, { useState, useEffect, useMemo } from 'react';
import { Exam, ExamSubmission, GradingPolicy, StudentAnswer } from '../types/exam';
import { normalizeStudentId, calculateGrade, formatCurrentTimestamp } from '../utils/gradeCalculator';
import { ElgiLogo } from './ElgiLogo';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Hash,
  BookOpen,
  Award,
  RotateCcw,
  Send,
  HelpCircle
} from 'lucide-react';

interface StudentExamRoomProps {
  exams: Exam[];
  gradingPolicy: GradingPolicy;
  existingSubmissions: ExamSubmission[];
  onSubmitExam: (submission: ExamSubmission) => void;
  onViewResult: (submission: ExamSubmission) => void;
  onViewDashboard?: () => void;
}

export const StudentExamRoom: React.FC<StudentExamRoomProps> = ({
  exams,
  gradingPolicy,
  existingSubmissions,
  onSubmitExam,
  onViewResult,
  onViewDashboard,
}) => {
  // Step 1: Pre-exam identification state
  const [studentId, setStudentId] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [isExamStarted, setIsExamStarted] = useState(false);

  // Step 2: In-exam state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> selectedOptionIndex
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Derived normalized student key (PDF Page 3 rule: EGI/2024/02486 -> EGI_2024_02486)
  const normalizedSid = useMemo(() => {
    return normalizeStudentId(studentId);
  }, [studentId]);

  // Past submissions for this student in this exam
  const studentPreviousAttempts = useMemo(() => {
    if (!normalizedSid || !selectedExam) return [];
    return existingSubmissions.filter(
      (sub) => sub.portalSid === normalizedSid && sub.examId === selectedExam.id
    );
  }, [existingSubmissions, normalizedSid, selectedExam]);

  const attemptNumber = studentPreviousAttempts.length + 1;
  const isAttemptLimitReached =
    selectedExam?.allowRepeatAttempts &&
    selectedExam.maxAttempts > 0 &&
    studentPreviousAttempts.length >= selectedExam.maxAttempts;

  // Initialize timer when exam starts
  useEffect(() => {
    if (!isExamStarted || !selectedExam) return;

    if (selectedExam.timeLimitMinutes > 0) {
      setTimeRemainingSeconds(selectedExam.timeLimitMinutes * 60);
    } else {
      setTimeRemainingSeconds(null);
    }
  }, [isExamStarted, selectedExam]);

  // Timer countdown
  useEffect(() => {
    if (!isExamStarted || timeRemainingSeconds === null) return;

    if (timeRemainingSeconds <= 0) {
      // Time is up! Auto-submit
      handleFinalSubmission();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, timeRemainingSeconds]);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !studentFullName.trim()) return;
    if (isAttemptLimitReached) return;

    setAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setIsExamStarted(true);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleClearOption = (questionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Auto-grading calculation
  const handleFinalSubmission = () => {
    if (!selectedExam) return;

    const studentAnswers: StudentAnswer[] = selectedExam.questions.map((q) => {
      const selected = answers[q.id] !== undefined ? answers[q.id] : null;
      const isCorrect = selected === q.correctOptionIndex;
      const pointsAwarded = isCorrect ? q.points : 0;

      return {
        questionId: q.id,
        questionNumber: q.number,
        selectedOptionIndex: selected,
        isCorrect,
        pointsAwarded,
        maxPoints: q.points,
      };
    });

    const totalScore = studentAnswers.reduce((sum, a) => sum + a.pointsAwarded, 0);
    const maxScore = selectedExam.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const { grade, label } = calculateGrade(percentage, gradingPolicy);

    const submission: ExamSubmission = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formatCurrentTimestamp(),
      studentId: studentId.trim(),
      portalSid: normalizedSid,
      studentFullName: studentFullName.trim(),
      courseCode: selectedExam.courseCode,
      courseTitle: selectedExam.courseTitle,
      quizTitle: selectedExam.title,
      examId: selectedExam.id,
      score: totalScore,
      maxScore,
      percentage,
      grade,
      attemptNumber,
      feedback: `Automated assessment score: ${totalScore}/${maxScore} (${percentage.toFixed(1)}%). Official grade: ${grade} (${label}).`,
      portalStatus: 'Sent',
      portalUpdatedAt: formatCurrentTimestamp(),
      notes: attemptNumber > 1 ? `Repeat attempt (${attemptNumber}) recorded.` : 'First submission.',
      answers: studentAnswers,
    };

    setIsExamStarted(false);
    setShowConfirmModal(false);
    onSubmitExam(submission);
    onViewResult(submission);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If exam has started: Render Examination Taking Interface
  if (isExamStarted && selectedExam) {
    const totalQuestions = selectedExam.questions.length;
    const currentQuestion = selectedExam.questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const isAnswered = answers[currentQuestion.id] !== undefined;
    const isFlagged = flaggedQuestions.has(currentQuestion.id);

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Exam Header Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 tracking-wide uppercase">
                  <span className="bg-blue-100 text-blue-950 px-2 py-0.5 rounded font-mono font-bold">ELGI · {selectedExam.courseCode}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 font-normal">{selectedExam.courseTitle}</span>
                </div>
                <h1 className="text-lg font-bold text-slate-900 mt-1">{selectedExam.title}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                  <span>Candidate: {studentFullName}</span>
                  <span aria-hidden="true">·</span>
                  <span>Portal SID: <strong className="text-blue-900">{normalizedSid}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Attempt #{attemptNumber}</span>
                </div>
              </div>

              {/* Timer & Controls */}
              <div className="flex items-center gap-3 shrink-0">
                {timeRemainingSeconds !== null && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono tabular-nums text-sm font-semibold ${
                      timeRemainingSeconds < 120
                        ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{formatTimer(timeRemainingSeconds)}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  Submit Exam
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Progress:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {answeredCount} of {totalQuestions} answered
                </span>
                <span>({Math.round((answeredCount / totalQuestions) * 100)}%)</span>
              </div>
              <div className="w-48 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="bg-blue-900 h-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Grid Navigator */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Question Navigator</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" /> Answered
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded border border-slate-300 bg-white inline-block" /> Unanswered
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> Flagged
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedExam.questions.map((q, idx) => {
                const answered = answers[q.id] !== undefined;
                const flagged = flaggedQuestions.has(q.id);
                const isCurrent = idx === currentQuestionIndex;

                let btnClass = 'bg-white border-slate-200 text-slate-700 hover:border-slate-400';
                if (answered) {
                  btnClass = 'bg-blue-900 border-blue-900 text-white font-semibold';
                }
                if (flagged) {
                  btnClass = 'bg-amber-100 border-amber-300 text-amber-900 font-semibold';
                }
                if (isCurrent) {
                  btnClass += ' ring-2 ring-amber-500 ring-offset-2';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-9 h-9 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer font-mono tabular-nums ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question View */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-950 bg-blue-100/70 px-2.5 py-1 rounded-md">
                  Question {currentQuestion.number} of {totalQuestions}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentQuestion.points} Point{currentQuestion.points > 1 ? 's' : ''}
                </span>
                {currentQuestion.topic && (
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    · {currentQuestion.topic}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isFlagged
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {isFlagged ? 'Flagged for Review' : 'Flag Question'}
              </button>
            </div>

            {/* Question Text */}
            <div className="py-6">
              <h2 className="text-lg sm:text-xl font-medium text-slate-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* 4 Options (A, B, C, D) */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;

                return (
                  <label
                    key={option.id}
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/60 ring-1 ring-blue-900'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-900 text-amber-400 font-extrabold'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {option.label}
                    </div>
                    <div className="flex-1 text-sm sm:text-base text-slate-800 pt-0.5 leading-normal">
                      {option.text}
                    </div>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>

            {/* Bottom Question Controls */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                {isAnswered && (
                  <button
                    type="button"
                    onClick={() => handleClearOption(currentQuestion.id)}
                    className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 transition-colors cursor-pointer"
                  >
                    Clear choice
                  </button>
                )}
              </div>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Next Question
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Review & Submit
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submission Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Exam Submission</h3>
                  <p className="text-xs text-slate-500">Your answers will be automatically marked and graded.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Total Questions:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Questions Answered:</span>
                  <span className="font-semibold text-indigo-700 tabular-nums">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Questions Unanswered:</span>
                  <span className={`font-semibold tabular-nums ${totalQuestions - answeredCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {totalQuestions - answeredCount}
                  </span>
                </div>
                {flaggedQuestions.size > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Questions Flagged:</span>
                    <span className="font-semibold tabular-nums">{flaggedQuestions.size}</span>
                  </div>
                )}
              </div>

              {totalQuestions - answeredCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    You still have {totalQuestions - answeredCount} unanswered question{totalQuestions - answeredCount > 1 ? 's' : ''}. Unanswered questions will receive 0 points.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmission}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Confirm & Grade Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 1: Registration & Exam Entrance Screen
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner with Academic Hero */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
          <img
            src="/src/assets/images/hero_academic_exam_1791721397135.jpg"
            alt="Academic Exam Hall"
            className="w-full h-48 sm:h-56 object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-900/70 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ElgiLogo className="w-12 h-12" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                  e-Learning GROUP INSTITUTE (ELGI)
                </span>
                <span className="text-xs text-blue-200">Official Student Examination Terminal</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              ELGI Auto-Graded Examination System
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
              Candidate assessment terminal. Responses are automatically submitted to the ELGI Examination Board database for administrative scoring and portal record synchronization.
            </p>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl border border-blue-900/15 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleStartExam} className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  Candidate Registration & Exam Selection
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensure your Student ID matches your official ELGI portal records. Your student key is normalized into your Portal SID.
                </p>
              </div>
              <ElgiLogo className="w-10 h-10 hidden sm:block shrink-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Student ID */}
              <div>
                <label htmlFor="student-id-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="student-id-input"
                    type="text"
                    required
                    placeholder="e.g. EGI/2024/02486"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none uppercase font-mono"
                  />
                </div>
                {/* PDF Normalization Live Indicator */}
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Portal SID:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {normalizedSid || 'ENTER ID ABOVE'}
                  </span>
                </div>
              </div>

              {/* Student Full Name */}
              <div>
                <label htmlFor="student-fullname-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-fullname-input"
                  type="text"
                  required
                  placeholder="e.g. Justice Essuman"
                  value={studentFullName}
                  onChange={(e) => setStudentFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                />
                <span className="block mt-1.5 text-[11px] text-slate-500">
                  Used for verified certificate and audit slip display.
                </span>
              </div>
            </div>

            {/* Select Examination */}
            <div>
              <label htmlFor="select-assessment-dropdown" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Course Assessment <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-assessment-dropdown"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-white text-slate-800 font-medium"
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    [{exam.courseCode}] {exam.title} ({exam.questions.length} Questions · {exam.totalPoints} Pts)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Exam Information Panel */}
            {selectedExam && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-blue-950 bg-blue-100 px-2 py-0.5 rounded font-mono">
                      ELGI · {selectedExam.courseCode} · {selectedExam.courseTitle}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedExam.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {selectedExam.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selectedExam.timeLimitMinutes > 0
                        ? `${selectedExam.timeLimitMinutes} Mins`
                        : 'Untimed'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedExam.description}
                </p>

                {/* Exam Settings from PDF */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Grading Release</span>
                    <span className="font-semibold text-slate-800">
                      {selectedExam.releaseGradesImmediately ? 'Instant Marking' : 'After Review'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Max Attempts</span>
                    <span className="font-semibold text-slate-800">
                      {selectedExam.allowRepeatAttempts ? `${selectedExam.maxAttempts} Allowed` : '1 Attempt Only'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Total Points</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {selectedExam.totalPoints} Points
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Current Attempt</span>
                    <span className="font-semibold text-blue-900 font-mono">
                      Attempt #{attemptNumber}
                    </span>
                  </div>
                </div>

                {/* Previous Attempt History if existing */}
                {studentPreviousAttempts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1.5">
                      Your Previous Attempts for this Exam:
                    </span>
                    <div className="space-y-1.5">
                      {studentPreviousAttempts.map((past) => (
                        <div
                          key={past.id}
                          className="flex items-center justify-between p-2 rounded bg-white border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500">Attempt {past.attemptNumber}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-600">{past.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 tabular-nums">
                              {past.score}/{past.maxScore} ({past.percentage.toFixed(0)}%)
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              past.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                              past.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                              past.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              Grade {past.grade}
                            </span>
                            <button
                              type="button"
                              onClick={() => onViewResult(past)}
                              className="text-blue-900 hover:underline text-[11px] font-semibold ml-2 cursor-pointer"
                            >
                              View Slip
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAttemptLimitReached && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      You have reached the maximum allowed attempts ({selectedExam.maxAttempts}) for this examination. Please contact your instructor.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Demo Pre-fill Button for Convenience */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStudentId('EGI/2024/02486');
                    setStudentFullName('Justice Essuman');
                  }}
                  className="text-xs text-blue-900 hover:text-blue-700 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  Sample student ID from ELGI PDF: EGI/2024/02486
                </button>

                {onViewDashboard && (
                  <button
                    type="button"
                    onClick={onViewDashboard}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold cursor-pointer hover:underline flex items-center gap-1"
                  >
                    View My Submissions History Dashboard →
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!studentId.trim() || !studentFullName.trim() || isAttemptLimitReached}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Start Examination
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
