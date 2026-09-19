import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  MapPin,
  TrendingUp,
  Award,
  Bell,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, PrayerLog, PrayerTimesData } from '../../types';
import {
  fetchPrayerTimes,
  formatTime12H,
  getNextUpcomingPrayer
} from '../../services/prayerService';
import {
  storageService,
  getPast12MonthKeys,
  formatMonthLabel
} from '../../services/storage';

interface PrayerTrackerViewProps {
  currentUser: User;
  onUserUpdate: (user: User) => void;
}

export const PrayerTrackerView: React.FC<PrayerTrackerViewProps> = ({
  currentUser,
  onUserUpdate,
}) => {
  const todayStr = '2026-09-19'; // Current system date
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loadingTimes, setLoadingTimes] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<string>(currentUser.city || 'Dhaka');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // 12-Month Retention selector (Module 2 requirement)
  const past12Months = getPast12MonthKeys(new Date(2026, 8, 19));
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(past12Months[0]);

  // Today's log
  const [todayLog, setTodayLog] = useState<PrayerLog>(() =>
    storageService.getPrayerLogForDate(currentUser.id, selectedDate)
  );

  // All logs for user
  const [allLogs, setAllLogs] = useState<PrayerLog[]>(() =>
    storageService.getPrayerLogs(currentUser.id)
  );

  useEffect(() => {
    let isMounted = true;
    setLoadingTimes(true);
    fetchPrayerTimes(selectedCity, 'Bangladesh', new Date(selectedDate))
      .then(data => {
        if (isMounted) {
          setPrayerTimes(data);
          setLoadingTimes(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingTimes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity, selectedDate]);

  useEffect(() => {
    setTodayLog(storageService.getPrayerLogForDate(currentUser.id, selectedDate));
  }, [selectedDate, currentUser.id]);

  const handleTogglePrayer = (prayerKey: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const currentStatus = todayLog[prayerKey];
    const { log, newlyCompletedAll } = storageService.updatePrayerStatus(
      currentUser.id,
      selectedDate,
      prayerKey,
      !currentStatus
    );

    setTodayLog({ ...log });
    setAllLogs(storageService.getPrayerLogs(currentUser.id));

    if (newlyCompletedAll) {
      setShowCelebration(true);
      // Trigger canvas confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d97706', '#10b981', '#3b82f6', '#f59e0b'],
      });

      // Add reward notification
      storageService.addNotification({
        id: `rew-${Date.now()}`,
        userId: currentUser.id,
        title: 'Alhamdulillah! 5/5 Prayers Completed',
        message: `You completed all 5 obligatory prayers for ${selectedDate}. Your namaz streak is now ${currentUser.prayerStreak + 1} days.`,
        type: 'reward',
        timestamp: new Date().toISOString(),
        isRead: false,
      });

      const updatedUser = storageService.getCurrentUser();
      onUserUpdate(updatedUser);
    }
  };

  const prayers = [
    { key: 'fajr' as const, name: 'Fajr', time: prayerTimes?.timings.Fajr || '04:25' },
    { key: 'dhuhr' as const, name: 'Dhuhr', time: prayerTimes?.timings.Dhuhr || '11:56' },
    { key: 'asr' as const, name: 'Asr', time: prayerTimes?.timings.Asr || '15:28' },
    { key: 'maghrib' as const, name: 'Maghrib', time: prayerTimes?.timings.Maghrib || '18:07' },
    { key: 'isha' as const, name: 'Isha', time: prayerTimes?.timings.Isha || '19:24' },
  ];

  const upcomingPrayer = prayerTimes ? getNextUpcomingPrayer(prayerTimes.timings) : null;

  // Monthly statistics for selected month
  const monthLogs = allLogs.filter(l => l.monthKey === selectedMonthKey);
  const totalDaysLogged = monthLogs.length;
  const daysWithAll5 = monthLogs.filter(l => l.allCompleted).length;
  const overallRate =
    totalDaysLogged > 0
      ? Math.round(
          (monthLogs.reduce((acc, l) => {
            const count = [l.fajr, l.dhuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length;
            return acc + count;
          }, 0) /
            (totalDaysLogged * 5)) *
            100
        )
      : 0;

  // Previous month comparison
  const selectedMonthIndex = past12Months.indexOf(selectedMonthKey);
  const prevMonthKey = past12Months[selectedMonthIndex + 1];
  const prevMonthLogs = prevMonthKey ? allLogs.filter(l => l.monthKey === prevMonthKey) : [];
  const prevMonthRate =
    prevMonthLogs.length > 0
      ? Math.round(
          (prevMonthLogs.reduce((acc, l) => {
            const count = [l.fajr, l.dhuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length;
            return acc + count;
          }, 0) /
            (prevMonthLogs.length * 5)) *
            100
        )
      : null;

  const monthDiff = prevMonthRate !== null ? overallRate - prevMonthRate : 0;

  const completedTodayCount = [
    todayLog.fajr,
    todayLog.dhuhr,
    todayLog.asr,
    todayLog.maghrib,
    todayLog.isha,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Prayer Tracker (Namaz)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              12-Month Rolling Retention
            </span>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Maintain spiritual discipline alongside your academic studies.
          </p>
        </div>

        {/* City & API Status */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <select
              value={selectedCity}
              onChange={e => {
                setSelectedCity(e.target.value);
                const updated = { ...currentUser, city: e.target.value };
                onUserUpdate(updated);
                storageService.saveCurrentUser(updated);
              }}
              className="bg-transparent text-stone-800 dark:text-stone-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="Dhaka">Dhaka, Bangladesh</option>
              <option value="Chittagong">Chittagong, Bangladesh</option>
              <option value="Sylhet">Sylhet, Bangladesh</option>
              <option value="Rajshahi">Rajshahi, Bangladesh</option>
              <option value="Khulna">Khulna, Bangladesh</option>
              <option value="London">London, UK</option>
              <option value="New York">New York, USA</option>
            </select>
          </div>

          <div
            title={
              prayerTimes?.source === 'aladhan_api'
                ? 'Connected to Aladhan Global API'
                : 'Using Dhaka verified schedule'
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 font-mono"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                prayerTimes?.source === 'aladhan_api' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{prayerTimes?.source === 'aladhan_api' ? 'Aladhan API' : 'Dhaka Table'}</span>
          </div>
        </div>
      </div>

      {/* Congratulatory Card (When 5/5 marked) */}
      {todayLog.allCompleted && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
              🤲
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                Alhamdulillah! All 5 Prayers Completed Today
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300 mt-0.5">
                Your discipline is rewarded. Namaz streak now standing at{' '}
                <span className="font-bold">{currentUser.prayerStreak} days</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-600 text-white font-medium shadow-xs">
              Daily Goal 100%
            </span>
          </div>
        </div>
      )}

      {/* Today's 5 Prayers Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Today's Schedule & Tracker
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-medium text-stone-500">{selectedDate}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Obligatory Daily Prayers ({completedTodayCount}/5 Done)
            </h2>
          </div>

          {upcomingPrayer && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="text-stone-500 dark:text-stone-400">Next Prayer: </span>
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  {upcomingPrayer.name} at {upcomingPrayer.time12}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 5 Prayers Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {prayers.map(prayer => {
            const isDone = todayLog[prayer.key];
            const markedTime = todayLog.completedAt[prayer.key];

            return (
              <div
                key={prayer.key}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/70 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-stone-50/50 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {prayer.name}
                    </span>
                    {isDone && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-semibold">
                        Done
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
                    {formatTime12H(prayer.time)}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {markedTime ? `Marked at ${markedTime}` : 'Not marked yet'}
                  </p>
                </div>

                <button
                  onClick={() => handleTogglePrayer(prayer.key)}
                  className={`mt-4 w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-amber-500 hover:text-amber-700'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-stone-400" />
                      <span>Mark Done</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODULE 2 & 3: 12-Month Retention History & Analytics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                12-Month Historical Retention & Monthly Reports
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Select any of the last 12 rolling months to inspect permanent prayer records.
            </p>
          </div>

          {/* Month Picker Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Pick Month:</span>
            <select
              value={selectedMonthKey}
              onChange={e => setSelectedMonthKey(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {past12Months.map(mKey => (
                <option key={mKey} value={mKey}>
                  {formatMonthLabel(mKey)} {mKey === past12Months[0] ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
            <span className="text-xs text-stone-500 font-medium">Monthly Adherence Rate</span>
            <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
              {overallRate}%
            </div>
            {prevMonthRate !== null && (
              <p
                className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
                  monthDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {monthDiff >= 0 ? `+${monthDiff}%` : `${monthDiff}%`} vs previous month
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
            <span className="text-xs text-stone-500 font-medium">Full Days (All 5 Completed)</span>
            <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
              {daysWithAll5} / {totalDaysLogged} Days
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {Math.round((daysWithAll5 / (totalDaysLogged || 1)) * 100)}% perfect daily record
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
            <span className="text-xs text-stone-500 font-medium">Data Retention Status</span>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Preserved in Cloud Storage
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Indexed by user ID & date. Not subject to auto-deletion.
            </p>
          </div>
        </div>

        {/* Daily Matrix for Selected Month */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
            Daily Record Breakdown ({formatMonthLabel(selectedMonthKey)})
          </h4>
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
            {monthLogs.map(log => {
              const dayNum = parseInt(log.date.split('-')[2], 10);
              const doneCount = [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(
                Boolean
              ).length;

              let bgClass = 'bg-stone-100 dark:bg-stone-800 text-stone-400';
              if (doneCount === 5) bgClass = 'bg-emerald-600 text-white font-bold';
              else if (doneCount >= 3)
                bgClass = 'bg-emerald-400/70 text-stone-900 font-semibold';
              else if (doneCount > 0) bgClass = 'bg-emerald-200 dark:bg-emerald-950 text-emerald-800';

              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedDate(log.date)}
                  title={`${log.date}: ${doneCount}/5 Prayers Completed`}
                  className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center transition-transform hover:scale-105 ${bgClass} ${
                    selectedDate === log.date ? 'ring-2 ring-amber-500' : ''
                  }`}
                >
                  <span className="text-[10px] opacity-75">{dayNum}</span>
                  <span className="text-[11px]">{doneCount}/5</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Click any day to view or edit its specific prayer timestamps above.
          </p>
        </div>
      </div>
    </div>
  );
};
