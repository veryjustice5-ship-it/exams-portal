import React, { useState, useMemo } from 'react';
import { ExamSubmission, PortalStatus } from '../types/exam';
import { exportPortalResultsToCSV, triggerDownload, normalizeStudentId, calculateGrade } from '../utils/gradeCalculator';
import {
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  Edit2,
  Check,
  X,
  Shield,
  Save
} from 'lucide-react';

interface TeacherGradebookProps {
  submissions: ExamSubmission[];
  onViewSubmission: (submission: ExamSubmission) => void;
  onUpdateSubmission: (updated: ExamSubmission) => void;
  onDeleteSubmission: (submissionId: string) => void;
  onClearAllSubmissions?: () => void;
}

export const TeacherGradebook: React.FC<TeacherGradebookProps> = ({
  submissions,
  onViewSubmission,
  onUpdateSubmission,
  onDeleteSubmission,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Admin record edit modal
  const [editingSubmission, setEditingSubmission] = useState<ExamSubmission | null>(null);

  // Extract unique courses
  const courseOptions = useMemo(() => {
    const set = new Set(submissions.map((s) => s.courseCode));
    return Array.from(set);
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        sub.studentFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.portalSid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = selectedCourse === 'all' || sub.courseCode === selectedCourse;
      const matchesGrade = selectedGrade === 'all' || sub.grade === selectedGrade;
      const matchesStatus = selectedStatus === 'all' || sub.portalStatus === selectedStatus;

      return matchesSearch && matchesCourse && matchesGrade && matchesStatus;
    });
  }, [submissions, searchTerm, selectedCourse, selectedGrade, selectedStatus]);

  // Summary statistics
  const stats = useMemo(() => {
    if (submissions.length === 0) return { total: 0, avg: 0, passRate: 0, gradeACount: 0 };
    const total = submissions.length;
    const avgScore = submissions.reduce((sum, s) => sum + s.percentage, 0) / total;
    const passed = submissions.filter((s) => s.grade !== 'F').length;
    const gradeA = submissions.filter((s) => s.grade === 'A').length;
    return {
      total,
      avg: Math.round(avgScore * 10) / 10,
      passRate: Math.round((passed / total) * 100),
      gradeACount: gradeA,
    };
  }, [submissions]);

  const handleExportCSV = () => {
    const csvData = exportPortalResultsToCSV(filteredSubmissions);
    triggerDownload(csvData, `ELGI_Portal_Results_${Date.now()}.csv`);
  };

  const handleStatusChange = (sub: ExamSubmission, newStatus: PortalStatus) => {
    onUpdateSubmission({
      ...sub,
      portalStatus: newStatus,
      portalUpdatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
  };

  const startEditNote = (sub: ExamSubmission) => {
    setEditingNoteId(sub.id);
    setTempNote(sub.notes || '');
  };

  const saveNote = (sub: ExamSubmission) => {
    onUpdateSubmission({
      ...sub,
      notes: tempNote,
    });
    setEditingNoteId(null);
  };

  const handleSaveEditedSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;

    const normalized = normalizeStudentId(editingSubmission.studentId);
    const score = Number(editingSubmission.score) || 0;
    const maxScore = Number(editingSubmission.maxScore) || 10;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const { grade } = calculateGrade(percentage);

    const updated: ExamSubmission = {
      ...editingSubmission,
      portalSid: normalized,
      score,
      maxScore,
      percentage,
      grade: editingSubmission.grade || grade,
      portalUpdatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    onUpdateSubmission(updated);
    setEditingSubmission(null);
  };

  const handleMarkAllSent = () => {
    submissions.forEach((sub) => {
      if (sub.portalStatus !== 'Sent') {
        onUpdateSubmission({
          ...sub,
          portalStatus: 'Sent',
          portalUpdatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Submissions</span>
          <span className="text-2xl font-bold text-blue-950 mt-1 block tabular-nums">
            {stats.total}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Recorded student attempts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Class Average</span>
          <span className="text-2xl font-bold text-blue-900 mt-1 block tabular-nums">
            {stats.avg}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Normalized percentage mean</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Pass Rate (Grade A–D)</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block tabular-nums">
            {stats.passRate}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Score ≥ 45% threshold</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Distinction (Grade A)</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block tabular-nums">
            {stats.gradeACount}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Students scored ≥ 70%</span>
        </div>
      </div>

      {/* Main Gradebook Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Panel Header & Actions */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-900" />
              <h2 className="text-base font-bold text-blue-950">
                ELGI Portal_Results Workbook
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact schema mapping from PDF: Timestamp · Student ID · Normalized SID · Full Name · Course · Score · Grade · Status · Notes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllSent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Sync All to Portal
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Export Portal_Results.csv
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate name, ID, SID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">All Courses</option>
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  Course: {c}
                </option>
              ))}
            </select>

            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">All Grades</option>
              <option value="A">Grade A (70-100%)</option>
              <option value="B">Grade B (60-69%)</option>
              <option value="C">Grade C (50-59%)</option>
              <option value="D">Grade D (45-49%)</option>
              <option value="F">Grade F (0-44%)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">All Portal Statuses</option>
              <option value="Sent">Status: Sent</option>
              <option value="Pending">Status: Pending</option>
              <option value="Updated">Status: Updated</option>
              <option value="Error">Status: Error</option>
            </select>

            {(searchTerm || selectedCourse !== 'all' || selectedGrade !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCourse('all');
                  setSelectedGrade('all');
                  setSelectedStatus('all');
                }}
                className="px-2.5 py-2 text-slate-600 hover:text-slate-900 font-medium underline text-xs cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Student ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Portal SID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Student Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Course</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Score</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">%</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Grade</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Att#</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Portal Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px]">Admin Notes</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">No submissions found</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm ? 'Try adjusting your search filters.' : 'Have students take an exam to view results here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isEditingNote = editingNoteId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                        {sub.timestamp}
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-medium text-slate-800">
                        {sub.studentId}
                      </td>

                      {/* Normalized SID (Page 3 format: EGI_2024_02486) */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                        {sub.portalSid}
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-900">
                        {sub.studentFullName}
                      </td>

                      {/* Course */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{sub.courseCode}</span>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-800">
                        {sub.score} / {sub.maxScore}
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono tabular-nums font-bold text-blue-950">
                        {sub.percentage.toFixed(1)}%
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block w-6 py-0.5 rounded text-xs font-bold font-mono text-center ${
                            sub.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : sub.grade === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.grade === 'D'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </td>

                      {/* Attempt Number */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap font-mono tabular-nums text-slate-600">
                        {sub.attemptNumber}
                      </td>

                      {/* Portal Status Dropdown */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <select
                          value={sub.portalStatus}
                          onChange={(e) => handleStatusChange(sub, e.target.value as PortalStatus)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                            sub.portalStatus === 'Sent'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : sub.portalStatus === 'Updated'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : sub.portalStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="Sent">Sent</option>
                          <option value="Pending">Pending</option>
                          <option value="Updated">Updated</option>
                          <option value="Error">Error</option>
                        </select>
                      </td>

                      {/* Admin Notes */}
                      <td className="py-3 px-3.5 text-slate-600">
                        {isEditingNote ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              className="px-2 py-1 rounded border border-blue-900 text-xs w-full focus:outline-none"
                              placeholder="Review note..."
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveNote(sub)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => startEditNote(sub)}
                            className="group flex items-center justify-between cursor-pointer py-0.5 px-1.5 -mx-1.5 rounded hover:bg-slate-100"
                            title="Click to edit notes"
                          >
                            <span className="truncate max-w-[140px] text-[11px]">
                              {sub.notes || <span className="text-slate-400 italic">Add note...</span>}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingSubmission(sub)}
                            title="Admin Edit Submission"
                            className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onViewSubmission(sub)}
                            title="View Exam Grade Slip"
                            className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSubmission(sub.id)}
                            title="Delete Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredSubmissions.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{submissions.length}</span> recorded student attempts.
          </div>
          <div className="font-mono text-[11px]">
            Format compliant with ELGI Student Portal Import Template (PDF Page 2 & 3).
          </div>
        </div>
      </div>

      {/* Admin Record Full Edit Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-blue-950">
                  Admin Edit Student Submission
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedSubmission} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingSubmission.studentFullName}
                    onChange={(e) =>
                      setEditingSubmission({ ...editingSubmission, studentFullName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student ID (e.g. EGI/2024/02486)</label>
                  <input
                    type="text"
                    required
                    value={editingSubmission.studentId}
                    onChange={(e) =>
                      setEditingSubmission({
                        ...editingSubmission,
                        studentId: e.target.value,
                        portalSid: normalizeStudentId(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Score Earned</label>
                  <input
                    type="number"
                    min="0"
                    max={editingSubmission.maxScore}
                    value={editingSubmission.score}
                    onChange={(e) =>
                      setEditingSubmission({ ...editingSubmission, score: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-center focus:outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Score</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSubmission.maxScore}
                    onChange={(e) =>
                      setEditingSubmission({ ...editingSubmission, maxScore: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-center focus:outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Letter Grade</label>
                  <select
                    value={editingSubmission.grade}
                    onChange={(e) =>
                      setEditingSubmission({ ...editingSubmission, grade: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-center focus:outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Portal Status</label>
                  <select
                    value={editingSubmission.portalStatus}
                    onChange={(e) =>
                      setEditingSubmission({
                        ...editingSubmission,
                        portalStatus: e.target.value as PortalStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="Sent">Sent</option>
                    <option value="Pending">Pending</option>
                    <option value="Updated">Updated</option>
                    <option value="Error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attempt #</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSubmission.attemptNumber}
                    onChange={(e) =>
                      setEditingSubmission({
                        ...editingSubmission,
                        attemptNumber: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-center focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Notes</label>
                <input
                  type="text"
                  value={editingSubmission.notes}
                  onChange={(e) =>
                    setEditingSubmission({ ...editingSubmission, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubmission(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
