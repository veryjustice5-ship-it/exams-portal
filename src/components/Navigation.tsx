import React from 'react';
import { ElgiLogo } from './ElgiLogo';
import {
  GraduationCap,
  LayoutDashboard,
  FileSpreadsheet,
  KeyRound,
  Sliders,
  PenTool,
  Lock,
  Unlock,
  ShieldCheck,
  LogOut,
  BarChart3,
  Award
} from 'lucide-react';

interface NavigationProps {
  currentView: 'student-exam' | 'result-slip' | 'student-receipt' | 'student-dashboard' | 'teacher-gradebook' | 'question-keys' | 'analytics' | 'policy';
  onNavigate: (view: 'student-exam' | 'student-dashboard' | 'teacher-gradebook' | 'question-keys' | 'analytics' | 'policy') => void;
  submissionCount: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  submissionCount,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
}) => {
  const handleProtectedNavigation = (
    view: 'teacher-gradebook' | 'question-keys' | 'analytics' | 'policy'
  ) => {
    if (isAdmin) {
      onNavigate(view);
    } else {
      onOpenAdminLogin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-blue-950 text-white border-b border-blue-900 shadow-sm">
      {/* Top micro institution bar */}
      <div className="bg-blue-900/50 border-b border-blue-900/80 px-4 sm:px-6 lg:px-8 py-1 text-[11px] flex items-center justify-between text-blue-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider uppercase text-amber-400">e-Learning GROUP INSTITUTE</span>
          <span>·</span>
          <span>Official Examination & Assessment Portal</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Admin Session Active
            </span>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="text-amber-300 hover:text-amber-200 font-medium underline flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              Faculty / Admin Sign-In
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark with ELGI brand logo */}
          <button
            onClick={() => onNavigate('student-exam')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <ElgiLogo className="w-10 h-10" />
            <div className="whitespace-nowrap shrink-0">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                ELGI AutoGrade
              </span>
              <span className="ml-2 text-xs font-semibold text-amber-400/90 hidden sm:inline">
                Exam Portal
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 single-line clean text links with active states */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onNavigate('student-exam')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentView === 'student-exam'
                  ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Take Exam
            </button>

            <button
              onClick={() => onNavigate('student-dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentView === 'student-dashboard' || currentView === 'student-receipt'
                  ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              My Submissions
            </button>

            <button
              onClick={() => handleProtectedNavigation('teacher-gradebook')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                currentView === 'teacher-gradebook' || currentView === 'result-slip'
                  ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <span>Portal Results</span>
              {isAdmin ? (
                <span className="text-xs px-1.5 py-0.2 bg-blue-900 text-amber-300 rounded tabular-nums font-mono">
                  {submissionCount}
                </span>
              ) : (
                <Lock className="w-3 h-3 text-blue-400" />
              )}
            </button>

            <button
              onClick={() => handleProtectedNavigation('question-keys')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                currentView === 'question-keys'
                  ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <span>Set Questions (Admin)</span>
              {!isAdmin && <Lock className="w-3 h-3 text-blue-400" />}
            </button>

            <button
              onClick={() => handleProtectedNavigation('analytics')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                currentView === 'analytics'
                  ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <span>Class Analytics</span>
              {!isAdmin && <Lock className="w-3 h-3 text-blue-400" />}
            </button>

            <button
              onClick={() => handleProtectedNavigation('policy')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                currentView === 'policy'
                  ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <span>Grading Policy</span>
              {!isAdmin && <Lock className="w-3 h-3 text-blue-400" />}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-semibold text-amber-300 bg-blue-900/80 px-2.5 py-1 rounded-lg border border-amber-400/30 font-mono">
                  ELGI Faculty Admin
                </span>
                <button
                  onClick={onAdminLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-blue-900 hover:bg-rose-900/60 hover:text-rose-200 rounded-lg border border-blue-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-950" />
                Admin Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-blue-900 text-xs font-medium text-blue-200 overflow-x-auto gap-2">
          <button
            onClick={() => onNavigate('student-exam')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentView === 'student-exam' ? 'text-amber-400 font-bold bg-blue-900' : ''
            }`}
          >
            Take Exam
          </button>
          <button
            onClick={() => onNavigate('student-dashboard')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentView === 'student-dashboard' || currentView === 'student-receipt' ? 'text-amber-400 font-bold bg-blue-900' : ''
            }`}
          >
            History
          </button>
          <button
            onClick={() => handleProtectedNavigation('teacher-gradebook')}
            className={`whitespace-nowrap px-2 py-1 rounded flex items-center gap-1 ${
              currentView === 'teacher-gradebook' ? 'text-amber-400 font-bold bg-blue-900' : ''
            }`}
          >
            Results {!isAdmin && <Lock className="w-2.5 h-2.5" />}
          </button>
          <button
            onClick={() => handleProtectedNavigation('question-keys')}
            className={`whitespace-nowrap px-2 py-1 rounded flex items-center gap-1 ${
              currentView === 'question-keys' ? 'text-amber-400 font-bold bg-blue-900' : ''
            }`}
          >
            Questions {!isAdmin && <Lock className="w-2.5 h-2.5" />}
          </button>
          <button
            onClick={() => handleProtectedNavigation('analytics')}
            className={`whitespace-nowrap px-2 py-1 rounded flex items-center gap-1 ${
              currentView === 'analytics' ? 'text-amber-400 font-bold bg-blue-900' : ''
            }`}
          >
            Analytics {!isAdmin && <Lock className="w-2.5 h-2.5" />}
          </button>
          <button
            onClick={() => handleProtectedNavigation('policy')}
            className={`whitespace-nowrap px-2 py-1 rounded flex items-center gap-1 ${
              currentView === 'policy' ? 'text-amber-400 font-bold bg-blue-900' : ''
            }`}
          >
            Policy {!isAdmin && <Lock className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
