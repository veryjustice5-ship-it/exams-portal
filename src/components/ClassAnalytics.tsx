import React, { useMemo } from 'react';
import { ExamSubmission, Exam } from '../types/exam';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

interface ClassAnalyticsProps {
  submissions: ExamSubmission[];
  exams: Exam[];
}

export const ClassAnalytics: React.FC<ClassAnalyticsProps> = ({ submissions, exams }) => {
  // Grade Distribution
  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    submissions.forEach((s) => {
      if (counts[s.grade] !== undefined) {
        counts[s.grade]++;
      }
    });

    const total = submissions.length || 1;
    return [
      { grade: 'A', label: 'Distinction (70-100%)', count: counts.A, percent: Math.round((counts.A / total) * 100), color: 'bg-emerald-500' },
      { grade: 'B', label: 'Very Good (60-69%)', count: counts.B, percent: Math.round((counts.B / total) * 100), color: 'bg-blue-500' },
      { grade: 'C', label: 'Good (50-59%)', count: counts.C, percent: Math.round((counts.C / total) * 100), color: 'bg-amber-500' },
      { grade: 'D', label: 'Pass (45-49%)', count: counts.D, percent: Math.round((counts.D / total) * 100), color: 'bg-orange-500' },
      { grade: 'F', label: 'Remedial (0-44%)', count: counts.F, percent: Math.round((counts.F / total) * 100), color: 'bg-rose-500' },
    ];
  }, [submissions]);

  // Overall metrics
  const metrics = useMemo(() => {
    if (submissions.length === 0) {
      return { avg: 0, median: 0, highest: 0, lowest: 0, passRate: 0 };
    }
    const scores = submissions.map((s) => s.percentage).sort((a, b) => a - b);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / scores.length) * 10) / 10;
    const mid = Math.floor(scores.length / 2);
    const median = scores.length % 2 !== 0 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2;
    const passed = submissions.filter((s) => s.grade !== 'F').length;
    const passRate = Math.round((passed / submissions.length) * 100);

    return {
      avg,
      median: Math.round(median * 10) / 10,
      highest: Math.round(scores[scores.length - 1] * 10) / 10,
      lowest: Math.round(scores[0] * 10) / 10,
      passRate,
    };
  }, [submissions]);

  // Question Error Rate / Item Analysis (from submissions with answers recorded)
  const itemAnalysis = useMemo(() => {
    const questionStats: Record<string, { questionNumber: number; correctCount: number; totalAttempts: number }> = {};

    submissions.forEach((sub) => {
      if (sub.answers && sub.answers.length > 0) {
        sub.answers.forEach((ans) => {
          if (!questionStats[ans.questionId]) {
            questionStats[ans.questionId] = {
              questionNumber: ans.questionNumber,
              correctCount: 0,
              totalAttempts: 0,
            };
          }
          questionStats[ans.questionId].totalAttempts++;
          if (ans.isCorrect) {
            questionStats[ans.questionId].correctCount++;
          }
        });
      }
    });

    return Object.entries(questionStats)
      .map(([qId, data]) => {
        const accuracy = data.totalAttempts > 0 ? Math.round((data.correctCount / data.totalAttempts) * 100) : 100;
        return {
          questionId: qId,
          number: data.questionNumber,
          correctCount: data.correctCount,
          totalAttempts: data.totalAttempts,
          accuracy,
        };
      })
      .sort((a, b) => a.number - b.number);
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            ELGI Assessment Analytics & Diagnostic Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical breakdown of candidate outcomes, letter grade distributions, and question difficulty metrics.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
            Average Score
          </span>
          <span className="text-2xl font-bold text-blue-900 mt-1 block font-mono tabular-nums">
            {metrics.avg}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Class overall mean</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
            Median Score
          </span>
          <span className="text-2xl font-bold text-slate-800 mt-1 block font-mono tabular-nums">
            {metrics.median}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">50th percentile</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
            Pass Rate
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block font-mono tabular-nums">
            {metrics.passRate}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Grades A, B, C, D</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
            Highest Score
          </span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block font-mono tabular-nums">
            {metrics.highest}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Peak performance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
            Lowest Score
          </span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block font-mono tabular-nums">
            {metrics.lowest}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Minimum result</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Visualizer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Grade Distribution (Standard Policy)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total: {submissions.length} Students
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {gradeDistribution.map((item) => (
              <div key={item.grade} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded font-bold font-mono text-center flex items-center justify-center bg-slate-100 text-slate-800 text-[11px]">
                      {item.grade}
                    </span>
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-semibold text-slate-900">{item.count} students</span>
                    <span className="text-slate-400">({item.percent}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Difficulty Analysis (Question by Question) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Item Difficulty & Success Rate
            </h3>
            <span className="text-xs text-slate-500">
              % of students answering correctly
            </span>
          </div>

          {itemAnalysis.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Detailed item analytics will appear once students complete examinations with individual question answers logged.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {itemAnalysis.map((item) => (
                <div key={item.questionId} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-mono font-bold text-slate-600 shrink-0">
                    Q{item.number}
                  </span>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.accuracy >= 75
                          ? 'bg-emerald-500'
                          : item.accuracy >= 50
                          ? 'bg-indigo-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono font-semibold tabular-nums text-slate-800 shrink-0">
                    {item.accuracy}%
                  </span>
                  <span className="w-16 text-right text-[11px] text-slate-400 shrink-0">
                    {item.accuracy < 50 ? 'Challenging' : 'Normal'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
