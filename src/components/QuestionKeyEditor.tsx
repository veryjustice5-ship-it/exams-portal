import React, { useState } from 'react';
import { Exam, Question, QuestionOption } from '../types/exam';
import { exportQuestionKeyToCSV, triggerDownload } from '../utils/gradeCalculator';
import {
  Download,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileText,
  KeyRound,
  Sliders,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface QuestionKeyEditorProps {
  exams: Exam[];
  onUpdateExam: (updated: Exam) => void;
  onCreateExam: (newExam: Exam) => void;
  onDeleteExam: (examId: string) => void;
}

export const QuestionKeyEditor: React.FC<QuestionKeyEditorProps> = ({
  exams,
  onUpdateExam,
  onCreateExam,
  onDeleteExam,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Helper to clone and edit
  const handleExamFieldChange = (field: keyof Exam, value: any) => {
    if (!currentExam) return;
    const updated = { ...currentExam, [field]: value };
    onUpdateExam(updated);
  };

  const handleQuestionChange = (questionId: string, updates: Partial<Question>) => {
    if (!currentExam) return;
    const updatedQuestions = currentExam.questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, ...updates };
      }
      return q;
    });

    const totalPoints = updatedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);

    onUpdateExam({
      ...currentExam,
      questions: updatedQuestions,
      totalPoints,
    });
  };

  const handleOptionTextChange = (questionId: string, optIndex: number, newText: string) => {
    if (!currentExam) return;
    const q = currentExam.questions.find((x) => x.id === questionId);
    if (!q) return;

    const newOptions = [...q.options];
    newOptions[optIndex] = { ...newOptions[optIndex], text: newText };

    handleQuestionChange(questionId, { options: newOptions });
  };

  const handleAddQuestion = () => {
    if (!currentExam) return;
    const newNumber = currentExam.questions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      number: newNumber,
      questionText: `Question ${newNumber} — replace this text with the actual question`,
      options: [
        { id: `opt-${Date.now()}-a`, label: 'A', text: 'Option A label' },
        { id: `opt-${Date.now()}-b`, label: 'B', text: 'Option B label' },
        { id: `opt-${Date.now()}-c`, label: 'C', text: 'Option C label' },
        { id: `opt-${Date.now()}-d`, label: 'D', text: 'Option D label' },
      ],
      correctOptionIndex: 0,
      points: 1,
      feedback: 'Add explanation or reference for this question here.',
      topic: 'General',
    };

    const newQuestions = [...currentExam.questions, newQ];
    const totalPoints = newQuestions.reduce((sum, q) => sum + q.points, 0);

    onUpdateExam({
      ...currentExam,
      questions: newQuestions,
      totalPoints,
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!currentExam || currentExam.questions.length <= 1) return;
    const filtered = currentExam.questions
      .filter((q) => q.id !== questionId)
      .map((q, idx) => ({ ...q, number: idx + 1 }));

    const totalPoints = filtered.reduce((sum, q) => sum + q.points, 0);

    onUpdateExam({
      ...currentExam,
      questions: filtered,
      totalPoints,
    });
  };

  const handleCreateBlankQuizTemplate = () => {
    // Exactly implements Page 1: "Blank Auto-Graded Google Forms Quiz Template"
    // 10 required multiple-choice question slots, 4 editable options, 1 point per question, placeholder answer key
    const slots: Question[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `template-q${i + 1}-${Date.now()}`,
      number: i + 1,
      questionText: `Question ${i + 1} — replace this text with the actual question`,
      options: [
        { id: `t-opt-${i}-a`, label: 'A', text: 'Option A label' },
        { id: `t-opt-${i}-b`, label: 'B', text: 'Option B label' },
        { id: `t-opt-${i}-c`, label: 'C', text: 'Option C label' },
        { id: `t-opt-${i}-d`, label: 'D', text: 'Option D label' },
      ],
      correctOptionIndex: 0,
      points: 1,
      feedback: 'Placeholder feedback explanation for Question ' + (i + 1),
      topic: 'Unit ' + Math.ceil((i + 1) / 2),
    }));

    const newBlankExam: Exam = {
      id: `exam-custom-${Date.now()}`,
      title: 'Blank Auto-Graded Quiz Template (10 Slots)',
      courseCode: 'NEW101',
      courseTitle: 'General Subject Assessment',
      description: 'Standard 10-question auto-graded template initialized from PDF specifications.',
      timeLimitMinutes: 15,
      releaseGradesImmediately: true,
      allowRepeatAttempts: true,
      maxAttempts: 2,
      totalPoints: 10,
      createdAt: new Date().toISOString().slice(0, 10),
      questions: slots,
    };

    onCreateExam(newBlankExam);
    setSelectedExamId(newBlankExam.id);
  };

  const handleExportCSV = () => {
    if (!currentExam) return;
    const csv = exportQuestionKeyToCSV(currentExam.questions);
    triggerDownload(csv, `Question_Key_${currentExam.courseCode}_${Date.now()}.csv`);
  };

  const triggerSaveNotification = () => {
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  if (!currentExam) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500">No exam selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950 text-amber-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-blue-950">
              ELGI Question_Key Planning & Exam Builder (Admin Mode)
            </h2>
            <p className="text-xs text-slate-500">
              Set questions, options (A–D), correct answer keys, point values, and explanation feedback.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exam Selector */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-semibold focus:outline-none"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                [{exam.courseCode}] {exam.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCreateBlankQuizTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            + New Blank Template (10 Slots)
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Question_Key.csv
          </button>

          <button
            type="button"
            onClick={triggerSaveNotification}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            Save Changes
          </button>
        </div>
      </div>

      {showSavedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All question keys, options, and points saved and applied to the examination engine.</span>
        </div>
      )}

      {/* Exam Configuration Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-500" />
          Assessment Settings & Metadata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
            <input
              type="text"
              value={currentExam.courseCode}
              onChange={(e) => handleExamFieldChange('courseCode', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              value={currentExam.courseTitle}
              onChange={(e) => handleExamFieldChange('courseTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Time Limit (Minutes)</label>
            <input
              type="number"
              min="0"
              max="180"
              value={currentExam.timeLimitMinutes}
              onChange={(e) => handleExamFieldChange('timeLimitMinutes', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-600 font-mono"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Set 0 for untimed exam</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1 text-xs">Assessment Title</label>
          <input
            type="text"
            value={currentExam.title}
            onChange={(e) => handleExamFieldChange('title', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* Toggles from PDF guidelines */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentExam.releaseGradesImmediately}
              onChange={(e) => handleExamFieldChange('releaseGradesImmediately', e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-slate-700 font-medium">
              Release grades & answer key immediately upon submission
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentExam.allowRepeatAttempts}
              onChange={(e) => handleExamFieldChange('allowRepeatAttempts', e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-slate-700 font-medium">
              Allow student repeat attempts (Max: {currentExam.maxAttempts})
            </span>
          </label>
        </div>
      </div>

      {/* Question Slots List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-blue-950">
              Question Slots ({currentExam.questions.length} Total · {currentExam.totalPoints} Total Points)
            </h3>
            <span className="text-xs text-slate-500">
              (Admin access enabled: edit any question prompt, options, or answer keys below)
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            Add Question Slot
          </button>
        </div>

        {currentExam.questions.map((question, qIdx) => (
          <div
            key={question.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
          >
            {/* Question Header & Points */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-950 flex items-center justify-center font-bold text-xs font-mono">
                  {question.number}
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Question {question.number}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Points:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(question.id, { points: parseInt(e.target.value) || 1 })
                    }
                    className="w-14 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs focus:outline-none"
                  />
                </div>

                {currentExam.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(question.id)}
                    title="Delete Question"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Text Prompt
              </label>
              <textarea
                rows={2}
                value={question.questionText}
                onChange={(e) => handleQuestionChange(question.id, { questionText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
                placeholder="Replace Question N with the actual question..."
              />
            </div>

            {/* 4 Editable Option Slots + Answer Key Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Editable Options & Correct Answer Key:
                </span>
                <span className="text-[11px] text-indigo-600 font-medium">
                  Select the radio button beside the correct answer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {question.options.map((opt, optIndex) => {
                  const isCorrect = question.correctOptionIndex === optIndex;

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/30'
                      }`}
                    >
                      {/* Radio for Correct Answer Key */}
                      <label
                        className="cursor-pointer flex items-center"
                        title={`Set Option ${opt.label} as correct answer`}
                      >
                        <input
                          type="radio"
                          name={`answer-key-${question.id}`}
                          checked={isCorrect}
                          onChange={() =>
                            handleQuestionChange(question.id, { correctOptionIndex: optIndex })
                          }
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span
                          className={`ml-1.5 w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-mono ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </label>

                      {/* Option Text Input */}
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          handleOptionTextChange(question.id, optIndex, e.target.value)
                        }
                        className="flex-1 px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white focus:outline-none focus:border-indigo-600"
                        placeholder={`Option ${opt.label} label...`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback / Explanation field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feedback / Pedagogical Explanation (Shown upon review)
              </label>
              <input
                type="text"
                value={question.feedback}
                onChange={(e) => handleQuestionChange(question.id, { feedback: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
                placeholder="Add feedback explanation for why this answer is correct..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
