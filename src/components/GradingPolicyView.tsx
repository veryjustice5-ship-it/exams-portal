import React, { useState } from 'react';
import { GradingPolicy, GradeRule } from '../types/exam';
import { normalizeStudentId, calculateGrade, DEFAULT_GRADING_POLICY } from '../utils/gradeCalculator';
import {
  Award,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Calculator
} from 'lucide-react';

interface GradingPolicyViewProps {
  policy: GradingPolicy;
  onUpdatePolicy: (policy: GradingPolicy) => void;
}

export const GradingPolicyView: React.FC<GradingPolicyViewProps> = ({
  policy,
  onUpdatePolicy,
}) => {
  const [testScorePercent, setTestScorePercent] = useState<number>(78);
  const [testStudentId, setTestStudentId] = useState<string>('EGI/2024/02486');
  const [isSaved, setIsSaved] = useState(false);

  const handleRuleChange = (index: number, field: keyof GradeRule, val: any) => {
    const newRules = [...policy.rules];
    newRules[index] = { ...newRules[index], [field]: val };
    onUpdatePolicy({
      ...policy,
      rules: newRules,
    });
  };

  const handleResetDefault = () => {
    onUpdatePolicy(DEFAULT_GRADING_POLICY);
  };

  const testResult = calculateGrade(testScorePercent, policy);
  const testSid = normalizeStudentId(testStudentId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            ELGI Institutional Grading Policy & Normalization Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure percentage-to-letter grade boundaries and test student key normalization (PDF Page 3).
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefault}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Reset to PDF Default Scale
        </button>
      </div>

      {/* Suggested Percentage-to-Grade Rule Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Grade Thresholds ({policy.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard mapping from PDF: 70–100 (A), 60–69 (B), 50–59 (C), 45–49 (D), 0–44 (F).
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Active Policy
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Letter Grade</th>
                <th className="py-3 px-4">Min Percentage (%)</th>
                <th className="py-3 px-4">Max Percentage (%)</th>
                <th className="py-3 px-4">Classification Descriptor</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policy.rules.map((rule, idx) => (
                <tr key={rule.grade} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span
                      className={`inline-block w-8 py-1 rounded text-center text-xs font-bold ${
                        rule.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rule.grade === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : rule.grade === 'C'
                          ? 'bg-amber-100 text-amber-800'
                          : rule.grade === 'D'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rule.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={rule.minPercentage}
                        onChange={(e) =>
                          handleRuleChange(idx, 'minPercentage', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs focus:outline-none"
                      />
                      <span className="text-slate-500 font-mono">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={rule.maxPercentage}
                        onChange={(e) =>
                          handleRuleChange(idx, 'maxPercentage', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1 rounded border border-slate-300 font-mono text-center text-xs focus:outline-none"
                      />
                      <span className="text-slate-500 font-mono">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={rule.label}
                      onChange={(e) => handleRuleChange(idx, 'label', e.target.value)}
                      className="w-full max-w-xs px-2.5 py-1 rounded border border-slate-300 text-xs focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        rule.grade !== 'F'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {rule.grade !== 'F' ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Simulation & Normalization Tester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Calculator Tester */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Calculator className="w-4 h-4 text-indigo-600" />
            Live Score & Letter Grade Simulator
          </div>
          <p className="text-xs text-slate-500">
            Slide the score percentage to test which letter grade is computed under the current policy.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Test Score Percentage:</label>
              <span className="text-lg font-bold font-mono text-indigo-700 tabular-nums">
                {testScorePercent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={testScorePercent}
              onChange={(e) => setTestScorePercent(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">
                  Computed Grade
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {testResult.label}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl font-mono shadow-xs">
                {testResult.grade}
              </div>
            </div>
          </div>
        </div>

        {/* Student ID Normalization Tester (Page 3) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Student ID Normalization Engine (PDF Spec)
          </div>
          <p className="text-xs text-slate-500">
            Formula from PDF Page 3: "derived from the Student ID by uppercasing and replacing non-alphanumeric characters with underscores. Example: EGI/2024/02486 → EGI_2024_02486"
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Raw Student ID
              </label>
              <input
                type="text"
                value={testStudentId}
                onChange={(e) => setTestStudentId(e.target.value)}
                placeholder="e.g. EGI/2024/02486"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-700 block uppercase tracking-wider font-semibold">
                  Derived Portal Student SID
                </span>
                <span className="text-base font-bold font-mono text-indigo-900 mt-0.5 block">
                  {testSid || '—'}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-indigo-700 bg-white px-2 py-1 rounded border border-indigo-200">
                ✓ NORMALIZED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
