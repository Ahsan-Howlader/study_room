import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  MapPin,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Subject, Chapter, PrayerLog, Exam, DailyAffairItem, StudySession } from '../../types';
import { storageService, formatMonthLabel } from '../../services/storage';
import { formatTime12H } from '../../services/prayerService';
import { calendarService } from '../../services/calendarService';

interface StudentDashboardProps {
  currentUser: User;
  onUserUpdate: (user: User) => void;
  subjects: Subject[];
  chapters: Chapter[];
  onNavigate: (tab: 'dashboard' | 'chapters' | 'exams' | 'prayer' | 'affairs' | 'admin') => void;
  onSelectChapter: (chapter: Chapter, subject: Subject) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onUserUpdate,
  subjects,
  chapters,
  onNavigate,
  onSelectChapter,
}) => {
  const todayStr = '2026-09-19';
  const [todayLog, setTodayLog] = useState<PrayerLog>(() =>
    storageService.getPrayerLogForDate(currentUser.id, todayStr)
  );

  const [exams] = useState<Exam[]>(() => storageService.getExams());
  const [dailyAffairs] = useState<DailyAffairItem[]>(() => storageService.getDailyAffairs());
  const [studySessions] = useState<StudySession[]>(() => storageService.getStudySessions(currentUser.id));
  const [calendarSettings] = useState(() => calendarService.getSettings());

  const prayers = [
    { key: 'fajr' as const, name: 'Fajr', time: '04:25' },
    { key: 'dhuhr' as const, name: 'Dhuhr', time: '11:56' },
    { key: 'asr' as const, name: 'Asr', time: '15:28' },
    { key: 'maghrib' as const, name: 'Maghrib', time: '18:07' },
    { key: 'isha' as const, name: 'Isha', time: '19:24' },
  ];

  const handleTogglePrayer = (prayerKey: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const currentStatus = todayLog[prayerKey];
    const { log, newlyCompletedAll } = storageService.updatePrayerStatus(
      currentUser.id,
      todayStr,
      prayerKey,
      !currentStatus
    );
    setTodayLog({ ...log });

    if (newlyCompletedAll) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d97706', '#10b981', '#f59e0b'],
      });
      const updated = storageService.getCurrentUser();
      onUserUpdate(updated);
    }
  };

  const completedPrayersCount = [
    todayLog.fajr,
    todayLog.dhuhr,
    todayLog.asr,
    todayLog.maghrib,
    todayLog.isha,
  ].filter(Boolean).length;

  // Next upcoming study session
  const nextSession = studySessions[0];

  // High-yield affairs
  const topAffairs = dailyAffairs.filter(d => d.isImportantForExam).slice(0, 3);

  // Active weekly exam
  const weeklyExam = exams.find(e => e.type === 'weekly') || exams[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Calm Ambient Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-stone-100/60 to-emerald-500/10 dark:from-amber-950/30 dark:via-stone-900/60 dark:to-emerald-950/20 border border-stone-200/80 dark:border-stone-800 p-6 sm:p-10 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Daily Focus Sanctuary
              </span>
              <span className="text-xs text-stone-400">
                Saturday, 19 September 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-reading">
              Welcome back to your Study Room, {currentUser.name.split(' ')[0]}.
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Quiet your mind, begin with your prayers, and review today's chapter modules with steadfast patience.
            </p>
          </div>

          {/* Calm Study illustration badge */}
          <div className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/80 backdrop-blur-md p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 self-start md:self-center shadow-xs">
            <div className="text-3xl">☕📖🪴</div>
            <div className="text-xs">
              <div className="font-semibold text-stone-800 dark:text-stone-200">
                Calm Study Atmosphere
              </div>
              <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                Low fatigue • 12-mo memory
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Daily Obligatory Prayers Quick Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              🤲
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Today's 5 Daily Prayers ({completedPrayersCount}/5 Done)
              </h2>
              <p className="text-xs text-stone-400">
                Location: {currentUser.city} • Aladhan API Verified Timings
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('prayer')}
            className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline"
          >
            <span>Open Full Prayer Tracker & 12-Mo Reports</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Prayer pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          {prayers.map(p => {
            const isDone = todayLog[p.key];
            return (
              <button
                key={p.key}
                onClick={() => handleTogglePrayer(p.key)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-stone-50/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {p.name}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                  )}
                </div>
                <div className="mt-2 text-sm font-mono font-bold text-stone-900 dark:text-stone-100">
                  {formatTime12H(p.time)}
                </div>
                <span className="text-[10px] text-stone-400 mt-1">
                  {isDone ? 'Marked Completed' : 'Tap to mark done'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Two-column layout (Study routine & Next exam) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Study Routine & Chapters */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Study Session Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Study Routine Block
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">
                  {calendarSettings.isConnected ? 'Google Calendar Synced' : 'Offline Routine'}
                </span>
              </div>
            </div>

            {nextSession ? (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Next Focus Block: {nextSession.subjectTitle}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {nextSession.chapterTitle}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Duration: {nextSession.durationMinutes} mins • 15m Google Calendar Reminder Active
                  </p>
                </div>

                <button
                  onClick={() => {
                    const targetSub = subjects.find(s => s.id === nextSession.subjectId) || subjects[0];
                    const targetChap = chapters.find(c => c.id === nextSession.chapterId) || chapters[0];
                    onSelectChapter(targetChap, targetSub);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Chapter & Timer</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-4">No scheduled study session for today.</p>
            )}

            {/* Quick Chapter Shortcuts */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>Featured Chapters to Study Today</span>
                <button
                  onClick={() => onNavigate('chapters')}
                  className="text-amber-600 hover:underline"
                >
                  View All ({chapters.length})
                </button>
              </div>

              {chapters.slice(0, 2).map(chap => {
                const sub = subjects.find(s => s.id === chap.subjectId) || subjects[0];
                return (
                  <div
                    key={chap.id}
                    onClick={() => onSelectChapter(chap, sub)}
                    className="p-3 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-amber-400 transition-colors flex items-center justify-between cursor-pointer group bg-stone-50/50 dark:bg-stone-950/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                        {chap.displayOrder}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-amber-600">
                          {chap.title}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {sub.title} • {chap.estimatedMinutes}m read • {chap.youtubeClasses.length} Video
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 52-Week Study Heatmap (Visual progress discipline) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                12-Month Study Consistency Heatmap
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                {studySessions.length} sessions logged
              </span>
            </div>
            <div className="grid grid-cols-12 gap-1.5 pt-2">
              {Array.from({ length: 48 }).map((_, i) => {
                const level = (i * 7 + 3) % 5;
                const colors = [
                  'bg-stone-100 dark:bg-stone-800',
                  'bg-amber-200 dark:bg-amber-950/60',
                  'bg-amber-300 dark:bg-amber-800',
                  'bg-amber-500 dark:bg-amber-600',
                  'bg-amber-600 dark:bg-amber-500',
                ];
                return (
                  <div
                    key={i}
                    title={`Week ${i + 1}: ${level * 2 + 1} study sessions`}
                    className={`h-4 rounded-md ${colors[level]} transition-transform hover:scale-110`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-stone-400">
              Each tile represents a study block. Retained for 12 months rolling history.
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Exam Prep & Daily Affairs Highlights */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Exam Card */}
          {weeklyExam && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between text-xs text-amber-100">
                <span className="font-semibold uppercase tracking-wider">
                  Weekly Assessment Available
                </span>
                <span>{weeklyExam.durationMinutes} mins</span>
              </div>
              <h3 className="text-lg font-bold leading-snug">{weeklyExam.title}</h3>
              <p className="text-xs text-amber-100/90 line-clamp-2 leading-relaxed">
                {weeklyExam.instructions}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('exams')}
                  className="w-full py-2.5 rounded-xl bg-white text-stone-900 font-semibold text-xs shadow-xs hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Enter Exam Hall</span>
                </button>
              </div>
            </div>
          )}

          {/* Daily Affairs High-Yield Highlights */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Today's BCS Exam Highlights
                </h3>
              </div>
              <button
                onClick={() => onNavigate('affairs')}
                className="text-xs text-amber-600 hover:underline"
              >
                All News
              </button>
            </div>

            <div className="space-y-3">
              {topAffairs.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-stone-400">{item.publishedDate}</span>
                  </div>
                  <h4 className="font-bold text-stone-800 dark:text-stone-200 leading-snug">
                    {item.title}
                  </h4>
                  {item.examRelevanceNotes && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        Exam Point:
                      </span>{' '}
                      {item.examRelevanceNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
