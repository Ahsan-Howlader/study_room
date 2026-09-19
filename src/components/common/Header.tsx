import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Moon,
  Sun,
  Bell,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Flame,
  Award,
  X
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { storageService } from '../../services/storage';

interface HeaderProps {
  currentUser: User;
  onUserUpdate: (user: User) => void;
  currentTab: 'dashboard' | 'chapters' | 'exams' | 'prayer' | 'affairs' | 'admin';
  onTabChange: (tab: 'dashboard' | 'chapters' | 'exams' | 'prayer' | 'affairs' | 'admin') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserUpdate,
  currentTab,
  onTabChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    storageService.getNotifications(currentUser.id)
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    storageService.saveNotifications(updated);
  };

  const toggleRole = () => {
    const newRole = currentUser.role === 'admin' ? 'student' : 'admin';
    const updatedUser = { ...currentUser, role: newRole as 'student' | 'admin' };
    onUserUpdate(updatedUser);
    storageService.saveCurrentUser(updatedUser);
    if (newRole === 'admin') {
      onTabChange('admin');
    } else if (currentTab === 'admin') {
      onTabChange('dashboard');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Study Desk', icon: Compass },
    { id: 'chapters', label: 'Chapters & Classes', icon: BookOpen },
    { id: 'exams', label: 'Exam Hall', icon: FileText },
    { id: 'prayer', label: 'Prayer Tracker', icon: Clock },
    { id: 'affairs', label: 'Daily Affairs', icon: CheckCircle2 },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-semibold text-lg border border-amber-600/20 shadow-xs group-hover:scale-105 transition-transform">
              SR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 dark:text-stone-100 text-lg tracking-tight">
                  Study Room
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800/60">
                  Focus Portal
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                Daily Study, Namaz & Current Affairs
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {/* Admin CMS tab (highlighted if admin role) */}
            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'admin'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Admin CMS</span>
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prayer Streak Pill */}
          <div
            title={`${currentUser.prayerStreak} day continuous prayer record`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium cursor-help"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Namaz Streak:</span>
            <span className="font-bold">{currentUser.prayerStreak}d</span>
          </div>

          {/* Study Streak Pill */}
          <div
            title={`${currentUser.streakCount} day study activity streak`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-medium cursor-help"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold">{currentUser.streakCount}d</span>
          </div>

          {/* Role switcher toggle (Instant testing between student & admin) */}
          <button
            onClick={toggleRole}
            title="Switch between Student and Admin perspective"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Role:</span>
            <span className="capitalize font-semibold text-amber-700 dark:text-amber-400">
              {currentUser.role}
            </span>
          </button>

          {/* Notification Center button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-stone-50 dark:ring-stone-950 animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Modal */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Notifications & Reminders
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-amber-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-stone-500 py-4 text-center">No new notifications.</p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl border text-xs transition-colors ${
                          notif.isRead
                            ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/60 dark:border-stone-800/60 text-stone-600 dark:text-stone-400'
                            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/50 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Warm Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"
            title={isDarkMode ? 'Switch to warm daylight mode' : 'Switch to night study mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden border-t border-stone-200/70 dark:border-stone-800 px-4 py-2 flex items-center justify-between overflow-x-auto gap-2 text-xs">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
                isActive
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onTabChange('admin')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'admin'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-stone-200 dark:border-stone-800/80 bg-stone-100/60 dark:bg-stone-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-amber-600/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-600/20">
            SR
          </div>
          <div>
            <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
              Study Room
            </span>
            <p className="text-[11px] text-stone-400">
              Calm Daily Study Portal & Exam Preparation Ecosystem
            </p>
          </div>
        </div>

        {/* Center: MANDATORY FOOTER ATTRIBUTION */}
        <div className="flex flex-col items-center sm:items-center text-center">
          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-900 dark:text-amber-200 font-medium text-xs">
            Created by Ahsan
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            All student records preserved for at least 12 rolling months
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            12-Month Retention Active
          </span>
          <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>
          <span>Google Calendar Live Sync</span>
          <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>
          <span>Aladhan API Connected</span>
        </div>
      </div>
    </footer>
  );
};
