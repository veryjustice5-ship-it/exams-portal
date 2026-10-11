import React, { useState, useMemo } from 'react';
import { ExamSubmission } from '../types/exam';
import { normalizeStudentId } from '../utils/gradeCalculator';
import { ElgiLogo } from './ElgiLogo';
import {
  FileCheck2,
  Search,
  Calendar,
  Clock,
  Printer,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  History,
  BookOpen
} from 'lucide-react';

interface StudentDashboardProps {
  submissions: ExamSubmission[];
  currentStudentId?: string;
  onViewReceipt: (submission: ExamSubmission) => void;
  onTakeExam: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  submissions,
  currentStudentId = '',
  onViewReceipt,
  onTakeExam,
}) => {
  const [searchId, setSearchId] = useState(currentStudentId || 'EGI/2024/02486');

  const normalizedSearchSid = useMemo(() => {
    return normalizeStudentId(searchId);
  }, [searchId]);

  // Filter submissions belonging to this student ID
  const studentSubmissions = useMemo(() => {
    if (!normalizedSearchSid) return [];
    return submissions.filter(
      (sub) => sub.portalSid === normalizedSearchSid || sub.studentId.toUpperCase() === searchId.trim().toUpperCase()
    );
  }, [submissions, normalizedSearchSid, searchId]);

  // Latest candidate name if found
  const candidateName = studentSubmissions[0]?.studentFullName || '';

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Sent':
        return {
          label: 'Verified & Logged in Portal',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          desc: 'Archived in central ELGI portal database',
        };
      case 'Updated':
        return {
          label: 'Faculty Record Updated',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          desc: 'Assessment review verified by faculty',
        };
      case 'Pending':
        return {
          label: 'Received & Pending Review',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          desc: 'Awaiting faculty evaluation queue',
        };
      default:
        return {
          label: 'Submission Logged',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          desc: 'Recorded in system',
        };
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-blue-900/15 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ElgiLogo className="w-16 h-16" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-600">
                  e-Learning GROUP INSTITUTE
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">Candidate Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-blue-950 mt-0.5">
                My Examination Submissions & Audit History
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Track your submitted examinations, verification receipts, and institutional synchronization status. Marks and final grades remain strictly confidential to faculty administration.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTakeExam}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Take an Examination
          </button>
        </div>

        {/* Student ID Lookup & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="student-id-lookup" className="block text-xs font-bold text-slate-700 mb-1.5">
              Lookup by Student ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="student-id-lookup"
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Student ID (e.g. EGI/2024/02486)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase font-semibold focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-600 sm:border-l sm:border-slate-200 sm:pl-6">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Normalized SID:</span>
              <span className="font-bold text-blue-900 text-sm mt-0.5 block">
                {normalizedSearchSid || '—'}
              </span>
            </div>
            {candidateName && (
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Candidate Name:</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {candidateName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submissions KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Total Attempts</span>
            <span className="text-2xl font-black text-blue-950 mt-1 block font-mono tabular-nums">
              {studentSubmissions.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Submitted to ELGI</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Unique Courses</span>
            <span className="text-2xl font-black text-blue-900 mt-1 block font-mono tabular-nums">
              {new Set(studentSubmissions.map((s) => s.courseCode)).size}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Courses evaluated</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Archive Status</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block mt-2 border border-emerald-200">
              ✓ Logged & Verified
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">In faculty database</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Grade Release</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md inline-block mt-2 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              Faculty Review Only
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Grades not disclosed</span>
          </div>
        </div>

        {/* Submissions History Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-900" />
              <h2 className="text-sm font-bold text-blue-950">
                Submitted Assessment History
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Showing {studentSubmissions.length} record{studentSubmissions.length === 1 ? '' : 's'}
            </span>
          </div>

          {studentSubmissions.length === 0 ? (
            <div className="py-16 text-center px-4 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No submissions found for ID: {searchId || 'None'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ensure your Student ID is entered correctly or take an examination to see your submission record here.
              </p>
              <button
                type="button"
                onClick={onTakeExam}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
              >
                Go to Exam Room
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 whitespace-nowrap">Submission Time</th>
                    <th className="py-3 px-4 whitespace-nowrap">Course</th>
                    <th className="py-3 px-4 whitespace-nowrap">Assessment Name</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Attempt</th>
                    <th className="py-3 px-4 whitespace-nowrap">Current Status</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Official Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {studentSubmissions.map((sub) => {
                    const statusInfo = getStatusDisplay(sub.portalStatus);

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Submission Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sub.timestamp}</span>
                          </div>
                        </td>

                        {/* Course Code */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-mono">
                            {sub.courseCode}
                          </span>
                        </td>

                        {/* Assessment Title */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 leading-snug">
                            {sub.quizTitle}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {sub.courseTitle}
                          </div>
                        </td>

                        {/* Attempt Number */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-semibold text-slate-700">
                          #{sub.attemptNumber}
                        </td>

                        {/* Status (No Marks or Grades Disclosed) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badge}`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {statusInfo.desc}
                            </span>
                          </div>
                        </td>

                        {/* Action: View Receipt */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onViewReceipt(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confidentiality Notice */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block text-amber-950">Notice Regarding Marks & Letter Grades:</span>
            <span>
              Specific scores, correct answer keys, and letter grades are withheld from this dashboard in accordance with ELGI institutional policies. All exam papers are auto-marked and archived for official examination board review. Final grades are published through the ELGI student portal at the end of the assessment period.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
