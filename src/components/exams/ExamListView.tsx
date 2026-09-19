import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Award,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Play,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Exam, Question, ExamAttempt, User } from '../../types';
import {
  storageService,
  getPast12MonthKeys,
  formatMonthLabel
} from '../../services/storage';
import { ExamTakingModal } from './ExamTakingModal';

interface ExamListViewProps {
  currentUser: User;
  onUserUpdate: (user: User) => void;
}

export const ExamListView: React.FC<ExamListViewProps> = ({ currentUser, onUserUpdate }) => {
  const [exams] = useState<Exam[]>(() => storageService.getExams());
  const [questions] = useState<Question[]>(() => storageService.getQuestions());
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() =>
    storageService.getExamAttempts(currentUser.id)
  );

  const [activeExamForModal, setActiveExamForModal] = useState<Exam | null>(null);

  // 12-Month selector
  const past12Months = getPast12MonthKeys(new Date(2026, 8, 19));
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all');

  const filteredAttempts =
    selectedMonthKey === 'all'
      ? attempts
      : attempts.filter(a => a.monthKey === selectedMonthKey);

  // Chart data: past 12 months average score trend
  const chartData = past12Months
    .slice()
    .reverse()
    .map(mKey => {
      const monthAtts = attempts.filter(a => a.monthKey === mKey);
      const avg =
        monthAtts.length > 0
          ? Math.round(
              monthAtts.reduce((acc, curr) => acc + curr.percentage, 0) / monthAtts.length
            )
          : null;

      return {
        month: formatMonthLabel(mKey),
        score: avg,
        attempts: monthAtts.length,
      };
    });

  const handleStartExam = (exam: Exam) => {
    setActiveExamForModal(exam);
  };

  const handleAttemptComplete = (attempt: ExamAttempt) => {
    setAttempts(storageService.getExamAttempts(currentUser.id));
  };

  const averageOverallScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Exam Hall & Assessments
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
              BCS & Competitive Ready
            </span>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Weekly subject drills and full-length monthly mock assessments with instant diagnostics.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-xs">
            <span className="text-stone-400">Total Attempts: </span>
            <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
              {attempts.length}
            </span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-xs">
            <span className="text-stone-400">Average Performance: </span>
            <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
              {averageOverallScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Active Exams Grid */}
      <div>
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Available Exams in Current Assessment Window</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map(exam => {
            const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
            const pastAttemptForThis = attempts.find(a => a.examId === exam.id);

            return (
              <div
                key={exam.id}
                className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        exam.type === 'weekly'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                      }`}
                    >
                      {exam.type} • {exam.difficulty}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Window: {exam.startDate} - {exam.endDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    {exam.instructions}
                  </p>

                  <div className="grid grid-cols-3 gap-2 my-5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800 text-center text-xs">
                    <div>
                      <span className="text-stone-400 text-[10px]">Duration</span>
                      <div className="font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                        {exam.durationMinutes} mins
                      </div>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px]">Questions</span>
                      <div className="font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                        {examQuestions.length || exam.questionIds.length} MCQs
                      </div>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px]">Pass Mark</span>
                      <div className="font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                        {exam.passingMarks}/{exam.totalMarks}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  {pastAttemptForThis ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Last Attempt: {pastAttemptForThis.score}/{exam.totalMarks} (
                      {pastAttemptForThis.percentage}%)
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">Not attempted yet</span>
                  )}

                  <button
                    onClick={() => handleStartExam(exam)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{pastAttemptForThis ? 'Retake Exam' : 'Enter Exam Hall'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODULE 2 & 4: 12-Month Historical Score Trends & Exam Attempt Archive */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                12-Month Score Progression & Result History
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Every weekly and monthly exam result is preserved for 12 months with date indexing.
            </p>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500">Filter By Month:</span>
            <select
              value={selectedMonthKey}
              onChange={e => setSelectedMonthKey(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All 12 Months (Full History)</option>
              {past12Months.map(mKey => (
                <option key={mKey} value={mKey}>
                  {formatMonthLabel(mKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Score Trend Recharts Visualization */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Average Exam Accuracy Trend Over Past 12 Months (%)
          </h4>
          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} stroke="#a8a29e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fafaf9',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => [
                    `${val !== null && val !== undefined ? String(val) : 'N/A'}%`,
                    'Average Score',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Results List */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
            Attempt Records ({filteredAttempts.length} Found)
          </h4>

          {filteredAttempts.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              No exam attempts recorded in this timeframe.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filteredAttempts.map(att => (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {att.examTitle}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        {att.examType}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Submitted on: {new Date(att.submittedAt).toLocaleDateString()} • Time spent:{' '}
                      {att.timeTakenMinutes} mins
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-400">
                        {att.score} pts
                      </span>
                      <div className="text-[11px] text-stone-400 font-mono">
                        {att.percentage}% Accuracy
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        att.percentage >= 60
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {att.percentage >= 60 ? 'Passed' : 'Needs Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Exam Modal */}
      {activeExamForModal && (
        <ExamTakingModal
          exam={activeExamForModal}
          questions={questions.filter(q => activeExamForModal.questionIds.includes(q.id))}
          currentUser={currentUser}
          onClose={() => setActiveExamForModal(null)}
          onAttemptCompleted={handleAttemptComplete}
        />
      )}
    </div>
  );
};
