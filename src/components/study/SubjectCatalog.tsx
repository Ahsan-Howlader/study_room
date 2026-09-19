import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronRight, Clock, Flag, Globe, Atom, Calculator, Award, Sparkles } from 'lucide-react';
import { Subject, Chapter, ChapterProgress } from '../../types';
import { storageService } from '../../services/storage';

interface SubjectCatalogProps {
  subjects: Subject[];
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter, subject: Subject) => void;
  userId: string;
}

export const SubjectCatalog: React.FC<SubjectCatalogProps> = ({
  subjects,
  chapters,
  onSelectChapter,
  userId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [progressMap] = useState<Record<string, ChapterProgress>>(() =>
    storageService.getChapterProgress(userId)
  );

  const categories = ['All', 'BCS Special', 'General', 'Science', 'Job Prep'];

  const filteredSubjects =
    selectedCategory === 'All'
      ? subjects
      : subjects.filter(s => s.category === selectedCategory);

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flag':
        return <Flag className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Atom':
        return <Atom className="w-5 h-5" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Syllabus & Lecture Catalog
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Carefully curated subjects with video lectures, reading notes, and reference materials.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 self-start text-xs font-medium">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects & Chapters List */}
      <div className="space-y-8">
        {filteredSubjects.map(subject => {
          const subjectChapters = chapters.filter(c => c.subjectId === subject.id);
          const completedChaptersCount = subjectChapters.filter(
            c => progressMap[c.id]?.isCompleted
          ).length;
          const subjectProgress =
            subjectChapters.length > 0
              ? Math.round((completedChaptersCount / subjectChapters.length) * 100)
              : 0;

          return (
            <div
              key={subject.id}
              className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs"
            >
              {/* Subject Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
                    {getSubjectIcon(subject.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        {subject.title}
                      </h2>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {subject.code}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {subject.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="sm:w-56 space-y-1.5 self-end sm:self-center">
                  <div className="flex justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400">
                    <span>Progress: {subjectProgress}%</span>
                    <span>
                      {completedChaptersCount}/{subjectChapters.length} Chapters
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${subjectProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Chapters Grid */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjectChapters.map(chap => {
                  const isDone = progressMap[chap.id]?.isCompleted;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => onSelectChapter(chap, subject)}
                      className="text-left p-4 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-800/60 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            Chapter {chap.displayOrder} • {chap.difficulty}
                          </span>
                          {isDone ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-stone-400">
                              <Clock className="w-3 h-3" />
                              {chap.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {chap.title}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {chap.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-stone-200/40 dark:border-stone-800 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-medium">
                        <span className="text-[11px] text-stone-400 font-normal">
                          {chap.youtubeClasses.length} Video Classes • {chap.materials.length} Materials
                        </span>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Read Lecture</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
