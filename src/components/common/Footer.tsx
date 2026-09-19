import React from 'react';
import {
  BookOpen,
  Heart,
  Calendar,
  ShieldCheck,
  Sparkles,
  Clock
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: 'dashboard' | 'chapters' | 'exams' | 'prayer' | 'affairs' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-stone-200/80 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Mission */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm tracking-tight">
                Study Room
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                A calm, disciplined daily sanctuary for competitive exam preparation.
              </p>
            </div>
          </div>

          {/* Quick links */}
          {onNavigate && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-stone-600 dark:text-stone-400">
              <button
                onClick={() => onNavigate('dashboard')}
                className="hover:text-amber-600 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('chapters')}
                className="hover:text-amber-600 transition-colors"
              >
                Syllabus
              </button>
              <button
                onClick={() => onNavigate('prayer')}
                className="hover:text-amber-600 transition-colors"
              >
                Prayer Tracker
              </button>
              <button
                onClick={() => onNavigate('exams')}
                className="hover:text-amber-600 transition-colors"
              >
                Exam Hall
              </button>
              <button
                onClick={() => onNavigate('affairs')}
                className="hover:text-amber-600 transition-colors"
              >
                Daily Affairs
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="hover:text-amber-600 transition-colors"
              >
                Admin CMS
              </button>
            </div>
          )}
        </div>

        {/* Bottom Bar: Mandatory Attribution & Retention Badge */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
            <span>Created by</span>
            <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              Ahsan
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              12-Month Rolling Retention Guaranteed
            </span>
            <span>•</span>
            <span className="font-mono">Dhaka Standard Time (UTC+6)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
