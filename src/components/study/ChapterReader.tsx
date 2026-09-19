import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Play,
  Share2,
  Tv,
  CheckSquare,
  Sparkles,
  Layers
} from 'lucide-react';
import { Chapter, Subject, ChapterProgress } from '../../types';
import { storageService } from '../../services/storage';
import { FocusTimer } from './FocusTimer';

interface ChapterReaderProps {
  chapter: Chapter;
  subject: Subject;
  onBack: () => void;
  userId: string;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  chapter,
  subject,
  onBack,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'videos' | 'materials'>('reading');
  const [progressMap, setProgressMap] = useState<Record<string, ChapterProgress>>(() =>
    storageService.getChapterProgress(userId)
  );
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    chapter.youtubeClasses[0]?.videoId || null
  );

  const currentProgress = progressMap[chapter.id] || {
    isCompleted: false,
    progressPercent: 0,
  };

  const handleToggleComplete = () => {
    const nextCompleted = !currentProgress.isCompleted;
    const nextPercent = nextCompleted ? 100 : 40;
    storageService.updateChapterProgress(userId, chapter.id, nextPercent, nextCompleted);
    setProgressMap(storageService.getChapterProgress(userId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Syllabus</span>
          </button>
          <span className="text-stone-300 dark:text-stone-700">/</span>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {subject.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
              currentProgress.isCompleted
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-emerald-500'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{currentProgress.isCompleted ? 'Marked Complete' : 'Mark as Complete'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chapter Heading Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/40 dark:bg-stone-900/60 border border-amber-200/60 dark:border-stone-800/80">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                Chapter {chapter.displayOrder} • {chapter.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <Clock className="w-3.5 h-3.5" />
                {chapter.estimatedMinutes} min read
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-3">
              {chapter.title}
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-3xl">
              {chapter.description}
            </p>

            {/* Navigation tabs inside chapter */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-amber-200/50 dark:border-stone-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('reading')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'reading'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lecture Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'videos'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Reference Classes ({chapter.youtubeClasses.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'materials'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF & Materials ({chapter.materials.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Lecture Notes (Readable Serif font for focus) */}
          {activeTab === 'reading' && (
            <div className="space-y-8">
              {chapter.sections.map(section => (
                <article
                  key={section.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs"
                >
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 pb-2 border-b border-stone-100 dark:border-stone-800">
                    {section.title}
                  </h2>
                  <div className="font-reading text-stone-800 dark:text-stone-200 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
                    {section.body}
                  </div>

                  {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                    <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                          High-Yield Exam Takeaways
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {section.keyTakeaways.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* TAB 2: YouTube Reference Classes (Module 1 Requirement) */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {chapter.youtubeClasses.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-500">
                  No reference classes linked yet. Admin can attach YouTube lecture URLs.
                </div>
              ) : (
                <>
                  {/* Active Video Player Embed */}
                  {activeVideoId && (
                    <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-md">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${activeVideoId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}

                  {/* Video List */}
                  <div className="grid grid-cols-1 gap-3">
                    {chapter.youtubeClasses.map(video => (
                      <div
                        key={video.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          activeVideoId === video.videoId
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-xs'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => setActiveVideoId(video.videoId)}
                            className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs hover:scale-105 transition-transform"
                          >
                            <Play className="w-4 h-4 ml-0.5" />
                          </button>
                          <div>
                            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                              {video.title}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              Instructor: {video.instructor} • Channel: {video.channel}
                            </p>
                            <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                              {video.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-[11px] font-mono text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
                            {video.durationMinutes} mins
                          </span>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            title="Open in YouTube"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: Study Materials & PDF Uploads */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              {chapter.materials.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-500">
                  No supplementary materials uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chapter.materials.map(mat => (
                    <div
                      key={mat.id}
                      className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-amber-400 transition-colors shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {mat.type} • {mat.storageProvider}
                          </span>
                          {mat.fileSize && (
                            <span className="text-xs text-stone-400">{mat.fileSize}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2">
                          {mat.title}
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-1">
                          Uploaded: {mat.uploadedAt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <span className="text-[11px] text-stone-500">
                          {mat.isExternal ? 'Official Resource Link' : 'Secure Storage File'}
                        </span>
                        <a
                          href={mat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-medium hover:opacity-90"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{mat.isExternal ? 'Open Link' : 'Download'}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Focus Timer & Chapter Outline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Integrated Pomodoro Focus Timer */}
          <FocusTimer
            chapterTitle={chapter.title}
            onSessionComplete={mins => {
              // Add a completed study session
              const now = new Date();
              const dateStr = now.toISOString().slice(0, 10);
              storageService.addStudySession({
                id: `sess-${Date.now()}`,
                userId,
                subjectId: subject.id,
                chapterId: chapter.id,
                subjectTitle: subject.title,
                chapterTitle: chapter.title,
                scheduledStartTime: now.toISOString(),
                scheduledEndTime: new Date(now.getTime() + mins * 60000).toISOString(),
                durationMinutes: mins,
                actualDurationMinutes: mins,
                isCompleted: true,
                googleCalendarSynced: true,
                date: dateStr,
                monthKey: dateStr.slice(0, 7),
              });
            }}
          />

          {/* Quick Syllabus Outline */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
              <Layers className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Chapter Outline
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {chapter.sections.map((sec, idx) => (
                <div key={sec.id} className="flex items-start gap-2 text-stone-600 dark:text-stone-400">
                  <span className="font-mono text-amber-600 font-semibold">{idx + 1}.</span>
                  <span className="leading-snug">{sec.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
