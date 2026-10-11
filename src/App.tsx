/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Exam, ExamSubmission, GradingPolicy } from './types/exam';
import { INITIAL_EXAMS, INITIAL_SUBMISSIONS } from './data/sampleExams';
import { DEFAULT_GRADING_POLICY } from './utils/gradeCalculator';
import { Navigation } from './components/Navigation';
import { StudentExamRoom } from './components/StudentExamRoom';
import { ExamResultSlip } from './components/ExamResultSlip';
import { TeacherGradebook } from './components/TeacherGradebook';
import { QuestionKeyEditor } from './components/QuestionKeyEditor';
import { ClassAnalytics } from './components/ClassAnalytics';
import { GradingPolicyView } from './components/GradingPolicyView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StudentSubmissionReceipt } from './components/StudentSubmissionReceipt';
import { StudentDashboard } from './components/StudentDashboard';
import { Lock, Shield, ArrowRight } from 'lucide-react';

type ViewMode =
  | 'student-exam'
  | 'result-slip'
  | 'student-receipt'
  | 'student-dashboard'
  | 'teacher-gradebook'
  | 'question-keys'
  | 'analytics'
  | 'policy';

const STORAGE_KEYS = {
  EXAMS: 'gradex_exams_v1',
  SUBMISSIONS: 'gradex_submissions_v1',
  POLICY: 'gradex_policy_v1',
  ADMIN_AUTH: 'elgi_admin_authenticated',
};

export default function App() {
  // Load state from localStorage or initial seed data
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return saved ? JSON.parse(saved) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });

  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [gradingPolicy, setGradingPolicy] = useState<GradingPolicy>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POLICY);
      return saved ? JSON.parse(saved) : DEFAULT_GRADING_POLICY;
    } catch {
      return DEFAULT_GRADING_POLICY;
    }
  });

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('student-exam');
  const [activeSubmission, setActiveSubmission] = useState<ExamSubmission | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    } catch (e) {
      console.warn('LocalStorage save failed for exams', e);
    }
  }, [exams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.warn('LocalStorage save failed for submissions', e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POLICY, JSON.stringify(gradingPolicy));
    } catch (e) {
      console.warn('LocalStorage save failed for policy', e);
    }
  }, [gradingPolicy]);

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    if (['teacher-gradebook', 'question-keys', 'analytics', 'policy'].includes(currentView)) {
      setCurrentView('student-exam');
    }
  };

  // Handlers for submissions
  const handleExamSubmit = (newSubmission: ExamSubmission) => {
    setSubmissions((prev) => [newSubmission, ...prev]);
  };

  const handleStudentSubmissionFinished = (sub: ExamSubmission) => {
    setActiveSubmission(sub);
    // Students only receive their official submission receipt with zero grades/marks shown
    // Only Admin can see scores and letter grades!
    setCurrentView('student-receipt');
  };

  const handleViewSubmissionResult = (sub: ExamSubmission) => {
    setActiveSubmission(sub);
    // Faculty Admin viewing full itemized grading report
    setCurrentView('result-slip');
  };

  const handleUpdateSubmission = (updated: ExamSubmission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (activeSubmission?.id === updated.id) {
      setActiveSubmission(updated);
    }
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    if (activeSubmission?.id === id) {
      setActiveSubmission(null);
      setCurrentView('teacher-gradebook');
    }
  };

  // Handlers for exams (Admin only)
  const handleUpdateExam = (updated: Exam) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleCreateExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const activeExamForSubmission = activeSubmission
    ? exams.find((e) => e.id === activeSubmission.examId) || exams[0]
    : undefined;

  // Protected View Gate Component
  const renderAdminProtectedGate = (viewTitle: string) => (
    <div className="max-w-xl mx-auto my-16 px-4">
      <div className="bg-white rounded-2xl border border-blue-900/15 p-8 text-center shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-950 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Faculty Access Restricted
          </span>
          <h2 className="text-xl font-bold text-blue-950">
            {viewTitle}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You must sign in as an ELGI faculty administrator to create questions, edit grades, or view institutional records.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('student-exam')}
            className="px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Return to Exam Room
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLoginModalOpen(true)}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-blue-950">
      {/* Top Header Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        submissionCount={submissions.length}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'student-exam' && (
          <StudentExamRoom
            exams={exams}
            gradingPolicy={gradingPolicy}
            existingSubmissions={submissions}
            onSubmitExam={handleExamSubmit}
            onViewResult={handleStudentSubmissionFinished}
            onViewDashboard={() => setCurrentView('student-dashboard')}
          />
        )}

        {/* Student Submission Receipt (Grades withheld from students) */}
        {currentView === 'student-receipt' && activeSubmission && (
          <StudentSubmissionReceipt
            submission={activeSubmission}
            exam={activeExamForSubmission}
            onReturnToExamList={() => setCurrentView('student-exam')}
            onViewDashboard={() => setCurrentView('student-dashboard')}
            onAdminLoginRequested={() => setIsAdminLoginModalOpen(true)}
          />
        )}

        {/* Student Exam History & Status Dashboard (Marks & grades withheld) */}
        {currentView === 'student-dashboard' && (
          <StudentDashboard
            submissions={submissions}
            currentStudentId={activeSubmission?.studentId || ''}
            onViewReceipt={(sub) => {
              setActiveSubmission(sub);
              setCurrentView('student-receipt');
            }}
            onTakeExam={() => setCurrentView('student-exam')}
          />
        )}

        {/* Official Faculty Grade Slip (Admin Only) */}
        {currentView === 'result-slip' && activeSubmission && (
          isAdmin ? (
            <ExamResultSlip
              submission={activeSubmission}
              exam={activeExamForSubmission}
              onRetakeExam={() => setCurrentView('student-exam')}
              onReturnToExamList={() => setCurrentView('student-exam')}
              onViewGradebook={() => setCurrentView('teacher-gradebook')}
            />
          ) : (
            <StudentSubmissionReceipt
              submission={activeSubmission}
              exam={activeExamForSubmission}
              onReturnToExamList={() => setCurrentView('student-exam')}
              onViewDashboard={() => setCurrentView('student-dashboard')}
              onAdminLoginRequested={() => setIsAdminLoginModalOpen(true)}
            />
          )
        )}

        {/* Protected Teacher Gradebook */}
        {currentView === 'teacher-gradebook' && (
          isAdmin ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <TeacherGradebook
                submissions={submissions}
                onViewSubmission={handleViewSubmissionResult}
                onUpdateSubmission={handleUpdateSubmission}
                onDeleteSubmission={handleDeleteSubmission}
              />
            </div>
          ) : (
            renderAdminProtectedGate('ELGI Portal_Results Gradebook')
          )
        )}

        {/* Protected Question Keys & Exam Builder */}
        {currentView === 'question-keys' && (
          isAdmin ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <QuestionKeyEditor
                exams={exams}
                onUpdateExam={handleUpdateExam}
                onCreateExam={handleCreateExam}
                onDeleteExam={handleDeleteExam}
              />
            </div>
          ) : (
            renderAdminProtectedGate('Question Key Planning & Exam Builder')
          )
        )}

        {/* Protected Analytics */}
        {currentView === 'analytics' && (
          isAdmin ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ClassAnalytics submissions={submissions} exams={exams} />
            </div>
          ) : (
            renderAdminProtectedGate('Classroom Performance Diagnostics')
          )
        )}

        {/* Protected Grading Policy */}
        {currentView === 'policy' && (
          isAdmin ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <GradingPolicyView
                policy={gradingPolicy}
                onUpdatePolicy={(p) => setGradingPolicy(p)}
              />
            </div>
          ) : (
            renderAdminProtectedGate('ELGI Grading Policy & Normalization Scale')
          )
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Footer */}
      <footer className="bg-blue-950 border-t border-blue-900 py-6 text-xs text-blue-200/80 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">ELGI Academic Portal</span>
            <span>·</span>
            <span>AutoGrade Assessment Engine</span>
            <span>·</span>
            <span className="text-blue-300">Student Portal Synchronization</span>
          </div>
          <div className="flex items-center gap-4 text-blue-300/80 font-mono text-[11px]">
            <span>Portal SID: EGI/YYYY/XXXXX → EGI_YYYY_XXXXX</span>
            <span>·</span>
            <span>70-100 A · 60-69 B · 50-59 C · 45-49 D · 0-44 F</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
