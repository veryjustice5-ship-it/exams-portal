import React from 'react';
import { ExamSubmission, Exam } from '../types/exam';
import { ElgiLogo } from './ElgiLogo';
import {
  CheckCircle2,
  Printer,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Lock,
  FileCheck2,
  AlertCircle
} from 'lucide-react';

interface StudentSubmissionReceiptProps {
  submission: ExamSubmission;
  exam?: Exam;
  onReturnToExamList: () => void;
  onViewDashboard?: () => void;
  onAdminLoginRequested: () => void;
}

export const StudentSubmissionReceipt: React.FC<StudentSubmissionReceiptProps> = ({
  submission,
  exam,
  onReturnToExamList,
  onViewDashboard,
  onAdminLoginRequested,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Action Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReturnToExamList}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Exam Room
            </button>
            {onViewDashboard && (
              <button
                type="button"
                onClick={onViewDashboard}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-blue-900" />
                My Submissions Dashboard
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print / Save Receipt
            </button>
            <button
              type="button"
              onClick={onAdminLoginRequested}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Admin Portal
            </button>
          </div>
        </div>

        {/* Official Receipt Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header with ELGI Logo */}
          <div className="border-b-2 border-blue-950 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ElgiLogo className="w-16 h-16" />
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 block">
                  e-Learning GROUP INSTITUTE (ELGI)
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-blue-950 mt-0.5">
                  Official Exam Submission Receipt
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Assessment Reference: {submission.id}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right sm:border-l sm:border-slate-200 sm:pl-6 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Submission Recorded
              </span>
              <span className="text-[11px] font-mono text-slate-500 block mt-1.5">
                {submission.timestamp}
              </span>
            </div>
          </div>

          {/* Submission Success Banner */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-950">
                Your Examination Answers Have Been Successfully Received
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
                Candidate answers have been securely logged and archived in the ELGI Examination Department database.
              </p>
            </div>
          </div>

          {/* Student & Course Audit Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Candidate & Assessment Verification Record
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Candidate Name</span>
                <span className="font-bold text-slate-900 block mt-0.5 text-sm">
                  {submission.studentFullName}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Entered Student ID</span>
                <span className="font-bold font-mono text-slate-900 block mt-0.5 text-sm">
                  {submission.studentId}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Normalized Portal SID</span>
                <span className="font-bold font-mono text-blue-900 block mt-0.5 text-sm">
                  {submission.portalSid}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Course Code & Title</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {submission.courseCode} — {submission.courseTitle}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Assessment Title</span>
                <span className="font-semibold text-slate-900 block mt-0.5 truncate">
                  {submission.quizTitle}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Attempt Record</span>
                <span className="font-mono font-semibold text-slate-800 block mt-0.5">
                  Attempt #{submission.attemptNumber}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-400 block font-medium">Submission Timestamp</span>
                <span className="font-mono text-slate-700 block mt-0.5">
                  {submission.timestamp} (GMT)
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Portal Status</span>
                <span className="font-semibold text-emerald-700 block mt-0.5 font-mono">
                  RECORDED ({submission.portalStatus})
                </span>
              </div>
            </div>
          </div>

          {/* Confidential Grade Policy Notice (Rule requested by user) */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-xs uppercase tracking-wide">
              <Lock className="w-4 h-4 text-amber-600" />
              Institutional Grade Confidentiality Policy
            </div>
            <p className="leading-relaxed text-amber-900/90 text-[11px]">
              In accordance with ELGI policy, individual test scores, itemized answers, and official letter grades are kept confidential and restricted to authorized faculty administrators. Grades are released exclusively through administrative publication on the official student portal.
            </p>
          </div>

          {/* Verification Sign-Off Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-blue-950">
                e-Learning GROUP INSTITUTE (ELGI) — Assessment Administration
              </p>
              <p className="mt-0.5 font-mono">
                Verification Key: {submission.id}
              </p>
            </div>
            <div className="text-right">
              <span className="block font-semibold text-slate-700">Exam Department Stamp</span>
              <span className="font-mono text-emerald-700 font-bold">✓ SUBMISSION VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
