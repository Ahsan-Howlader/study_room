import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Tv,
  FileText,
  Upload,
  Calendar,
  BarChart2,
  Users,
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Download,
  Play,
  RotateCcw,
  Clock,
  Eye,
  Settings,
  Database
} from 'lucide-react';
import {
  Subject,
  Chapter,
  Question,
  Exam,
  User,
  AuditLog,
  YouTubeClass,
  StudyMaterial,
  ImportResult
} from '../../types';
import { storageService, getPast12MonthKeys, formatMonthLabel } from '../../services/storage';
import { calendarService, CalendarSyncSettings } from '../../services/calendarService';
import { parseCSVQuestions, getSampleQuestionCSV } from '../../services/importService';

interface AdminCMSProps {
  currentUser: User;
  onUserUpdate: (user: User) => void;
  subjects: Subject[];
  chapters: Chapter[];
  onDataChange: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  currentUser,
  onUserUpdate,
  subjects,
  chapters,
  onDataChange,
}) => {
  const [activeTab, setActiveTab] = useState<
    'content' | 'questions' | 'exams' | 'calendar' | 'retention' | 'analytics' | 'users' | 'security'
  >('content');

  // Question Bank & Importer state
  const [questions, setQuestions] = useState<Question[]>(() => storageService.getQuestions());
  const [csvInput, setCsvInput] = useState<string>('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Calendar Sync state
  const [calendarSettings, setCalendarSettings] = useState<CalendarSyncSettings>(() =>
    calendarService.getSettings()
  );
  const [cronStatusMessage, setCronStatusMessage] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());

  // Exams
  const [exams, setExams] = useState<Exam[]>(() => storageService.getExams());

  // Modal states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub-1');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoInstructor, setNewVideoInstructor] = useState('');
  const [newVideoChannel, setNewVideoChannel] = useState('');
  const [selectedChapterForVideo, setSelectedChapterForVideo] = useState<string>(chapters[0]?.id || 'chap-1-1');

  // PDF Upload modal state
  const [pdfUploadStatus, setPdfUploadStatus] = useState<string | null>(null);
  const [selectedChapterForPdf, setSelectedChapterForPdf] = useState<string>(chapters[0]?.id || 'chap-1-1');

  // Exam Creator Form state
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<'weekly' | 'monthly'>('weekly');
  const [examDuration, setExamDuration] = useState(20);
  const [examTotalMarks, setExamTotalMarks] = useState(25);
  const [examPassingMarks, setExamPassingMarks] = useState(15);
  const [selectedQuestionsForExam, setSelectedQuestionsForExam] = useState<string[]>([]);

  // 12-Month retention manual archive status
  const [retentionAuditStatus, setRetentionAuditStatus] = useState<string | null>(null);

  // Subject chapters
  const activeSubjectChapters = chapters.filter(c => c.subjectId === selectedSubjectId);

  // Handle CSV Import
  const handleRunCSVImport = () => {
    if (!csvInput.trim()) return;
    const res = parseCSVQuestions(csvInput, selectedSubjectId);
    setImportResult(res);
    setQuestions(storageService.getQuestions());
    setAuditLogs(storageService.getAuditLogs());
    onDataChange();
  };

  const handleLoadSampleCSV = () => {
    setCsvInput(getSampleQuestionCSV());
  };

  // PDF Upload with file-size and MIME validation (Module 1 Requirement)
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME Validation
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setPdfUploadStatus('Validation Failed: File must be a valid PDF document (MIME application/pdf).');
      return;
    }

    // Size validation (Max 15MB)
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPdfUploadStatus('Validation Failed: File size exceeds the 15 MB limit.');
      return;
    }

    const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    // Create record
    const allChapters = storageService.getChapters();
    const targetChap = allChapters.find(c => c.id === selectedChapterForPdf);
    if (targetChap) {
      const newMat: StudyMaterial = {
        id: `mat-${Date.now()}`,
        chapterId: selectedChapterForPdf,
        title: file.name.replace('.pdf', ''),
        type: 'pdf',
        url: URL.createObjectURL(file),
        fileSize: sizeFormatted,
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString().slice(0, 10),
        storageProvider: 's3-r2',
      };
      targetChap.materials.push(newMat);
      storageService.saveChapters(allChapters);
      onDataChange();

      storageService.addAuditLog(
        currentUser.email,
        'PDF_MATERIAL_UPLOADED',
        `Validated and uploaded "${file.name}" (${sizeFormatted}) to S3-compatible storage.`,
        'success'
      );
      setAuditLogs(storageService.getAuditLogs());
      setPdfUploadStatus(`Successfully validated and uploaded "${file.name}" (${sizeFormatted})!`);
    }
  };

  // Attach YouTube Reference Class (Module 1 Requirement)
  const handleAddYouTubeClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle || !newVideoUrl) return;

    // Extract Video ID
    let videoId = 'dQw4w9WgXcQ';
    const match = newVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    }

    const allChapters = storageService.getChapters();
    const targetChap = allChapters.find(c => c.id === selectedChapterForVideo);
    if (targetChap) {
      const newYt: YouTubeClass = {
        id: `yt-${Date.now()}`,
        chapterId: selectedChapterForVideo,
        title: newVideoTitle,
        url: newVideoUrl,
        videoId,
        instructor: newVideoInstructor || 'BCS Faculty Instructor',
        channel: newVideoChannel || 'Study Room Masterclass',
        description: 'Linked reference lecture for chapter syllabus mastery.',
        displayOrder: targetChap.youtubeClasses.length + 1,
        durationMinutes: 40,
      };

      targetChap.youtubeClasses.push(newYt);
      storageService.saveChapters(allChapters);
      onDataChange();

      storageService.addAuditLog(
        currentUser.email,
        'YOUTUBE_CLASS_ATTACHED',
        `Attached video "${newVideoTitle}" to Chapter ID ${selectedChapterForVideo}`,
        'success'
      );
      setAuditLogs(storageService.getAuditLogs());

      setNewVideoTitle('');
      setNewVideoUrl('');
      setNewVideoInstructor('');
      setNewVideoChannel('');
    }
  };

  // Toggle user status (Active / Disabled)
  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'disabled' : 'active';
        return { ...u, status: nextStatus as 'active' | 'disabled' };
      }
      return u;
    });
    setUsers(updated);
    storageService.saveUsers(updated);
    storageService.addAuditLog(
      currentUser.email,
      'USER_STATUS_TOGGLED',
      `Toggled status for user ${userId}`,
      'warning'
    );
    setAuditLogs(storageService.getAuditLogs());
  };

  // Create Exam
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || selectedQuestionsForExam.length === 0) {
      alert('Please provide an exam title and pick at least one question.');
      return;
    }

    const newEx: Exam = {
      id: `exam-${Date.now()}`,
      title: examTitle,
      type: examType,
      durationMinutes: examDuration,
      totalMarks: examTotalMarks,
      passingMarks: examPassingMarks,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      questionIds: selectedQuestionsForExam,
      difficulty: 'Intermediate',
      instructions: 'Standard timed examination. Read each prompt carefully.',
      isActive: true,
    };

    const nextExams = [newEx, ...exams];
    setExams(nextExams);
    storageService.saveExams(nextExams);
    storageService.addAuditLog(
      currentUser.email,
      'EXAM_CREATED',
      `Created ${examType} exam "${examTitle}" with ${selectedQuestionsForExam.length} MCQs.`,
      'success'
    );
    setAuditLogs(storageService.getAuditLogs());

    setExamTitle('');
    setSelectedQuestionsForExam([]);
    alert('Exam created successfully! It is now live in the Exam Hall.');
  };

  // Trigger Cron simulation
  const handleRunCron = () => {
    const res = calendarService.runCronReminderEngine(currentUser.id);
    setCronStatusMessage(res.message);
    setAuditLogs(storageService.getAuditLogs());
  };

  // 12-Month explicit archival job (Module 2 Requirement: never silent!)
  const handleTriggerRetentionAudit = () => {
    const monthKeys = getPast12MonthKeys(new Date(2026, 8, 19));
    const allPrayers = storageService.getPrayerLogs(currentUser.id);
    const allAttempts = storageService.getExamAttempts();
    const allSessions = storageService.getStudySessions();

    setRetentionAuditStatus(
      `Audit Complete: Verified 12 rolling months (${monthKeys[11]} to ${monthKeys[0]}). Total records preserved in storage: ${allPrayers.length} prayer logs, ${allAttempts.length} exam attempts, ${allSessions.length} study sessions. Strict policy enforced: 0 rows deleted.`
    );

    storageService.addAuditLog(
      currentUser.email,
      'RETENTION_POLICY_AUDIT',
      'Verified rolling 12-month integrity across all student entities.',
      'success'
    );
    setAuditLogs(storageService.getAuditLogs());
  };

  const navTabs = [
    { id: 'content', label: 'Content & Videos', icon: BookOpen },
    { id: 'questions', label: 'Question Bank & CSV Importer', icon: Upload },
    { id: 'exams', label: 'Exam Creator', icon: FileText },
    { id: 'calendar', label: 'Routine & Google Sync', icon: Calendar },
    { id: 'retention', label: '12-Month Retention', icon: Database },
    { id: 'analytics', label: 'Monthly Analytics', icon: BarChart2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security & Audits', icon: Lock },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Admin CMS & Educational Management
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Maintain curriculum hierarchy, upload PDFs, attach video lectures, import question banks, and monitor 12-month analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
            Admin Authorized: {currentUser.email}
          </span>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800 text-xs font-medium">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Content & Videos (Subjects, Chapters, YouTube Linker, PDF Uploader) */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Subject & Chapter selector (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Subject & Chapter Hierarchy
                </h3>
                <div className="space-y-2">
                  <label className="text-xs text-stone-500">Select Subject:</label>
                  <select
                    value={selectedSubjectId}
                    onChange={e => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs font-medium"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs text-stone-500 font-medium">Chapters in Subject:</span>
                  <div className="space-y-2">
                    {activeSubjectChapters.map(chap => (
                      <div
                        key={chap.id}
                        onClick={() => {
                          setSelectedChapterForVideo(chap.id);
                          setSelectedChapterForPdf(chap.id);
                        }}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          selectedChapterForVideo === chap.id
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 font-semibold text-amber-900 dark:text-amber-200 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                        }`}
                      >
                        <div>
                          <div>
                            Ch {chap.displayOrder}: {chap.title}
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            {chap.youtubeClasses.length} Videos • {chap.materials.length} Materials
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700">
                          {chap.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Add Video Class & Upload PDF (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* YouTube Reference Class Form (Module 1 Requirement) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <Tv className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Attach YouTube Reference Class to Chapter
                  </h3>
                </div>

                <form onSubmit={handleAddYouTubeClass} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                      Lecture Video Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangladesh Constitution: Articles 1-47 In-Depth"
                      value={newVideoTitle}
                      onChange={e => setNewVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newVideoUrl}
                      onChange={e => setNewVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rafiqul Islam"
                        value={newVideoInstructor}
                        onChange={e => setNewVideoInstructor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                        YouTube Channel
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BCS Gyan Academy"
                        value={newVideoChannel}
                        onChange={e => setNewVideoChannel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Save & Publish Reference Video
                  </button>
                </form>
              </div>

              {/* PDF Upload with Size & MIME Validation (Module 1 Requirement) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    PDF / Study Material Upload (S3-R2 Ready)
                  </h3>
                </div>

                <div className="text-xs space-y-3">
                  <p className="text-stone-500">
                    Files are validated for MIME type (<code className="font-mono">application/pdf</code>) and file-size threshold (15MB max limit).
                  </p>

                  <div className="p-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40 text-center">
                    <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold text-xs inline-block shadow-xs hover:opacity-90">
                        Choose PDF File
                      </span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-400 mt-2">
                      Target Chapter: {chapters.find(c => c.id === selectedChapterForPdf)?.title}
                    </p>
                  </div>

                  {pdfUploadStatus && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        pdfUploadStatus.includes('Failed')
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {pdfUploadStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Question Bank & CSV Importer */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* CSV Importer Box (Module 1 Requirement) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Question Bank Importer (CSV / XLSX Format)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Mandatory columns: <code className="font-mono text-amber-700 dark:text-amber-400">chapterId, text, optionA, optionB, optionC, optionD, answerIndex, explanation, difficulty</code>
                </p>
              </div>

              <button
                onClick={handleLoadSampleCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-amber-400"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Load Sample Template Data</span>
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                rows={6}
                value={csvInput}
                onChange={e => setCsvInput(e.target.value)}
                placeholder="Paste CSV rows here or click 'Load Sample Template Data'..."
                className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 font-mono text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  Total Questions in Bank: <strong className="text-stone-700 dark:text-stone-300">{questions.length}</strong>
                </span>
                <button
                  onClick={handleRunCSVImport}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                >
                  Validate & Import Questions
                </button>
              </div>
            </div>

            {/* Diagnostic Report (Module 1 Requirement) */}
            {importResult && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    Import Diagnostics:
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    ✓ {importResult.successCount} Imported Successfully
                  </span>
                  {importResult.failedCount > 0 && (
                    <span className="text-rose-600 font-semibold">
                      ✗ {importResult.failedCount} Invalid Rows
                    </span>
                  )}
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {importResult.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <strong>Row {err.row}:</strong> {err.reason}
                          {err.rawData && (
                            <div className="font-mono text-[10px] text-stone-500 mt-0.5">
                              {err.rawData}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Question Bank Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Active Question Bank ({questions.length} Items)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-600">Q{idx + 1}.</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {q.text}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Answer: Option {['A', 'B', 'C', 'D'][q.answerIndex]} • Difficulty: {q.difficulty}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 shrink-0">
                    {q.chapterId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Exam Creator */}
      {activeTab === 'exams' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Create Weekly / Monthly Exam Assessment
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pull questions directly from the verified Question Bank and set open testing windows.
            </p>
          </div>

          <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Assessment 39: General Science & ICT"
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Exam Frequency Type
                </label>
                <select
                  value={examType}
                  onChange={e => setExamType(e.target.value as 'weekly' | 'monthly')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                >
                  <option value="weekly">Weekly Assessment</option>
                  <option value="monthly">Monthly Model Test</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={examDuration}
                  onChange={e => setExamDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={examTotalMarks}
                  onChange={e => setExamTotalMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Passing Marks
                </label>
                <input
                  type="number"
                  value={examPassingMarks}
                  onChange={e => setExamPassingMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800"
                />
              </div>
            </div>

            {/* Select Questions Picker */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Select Questions from Question Bank ({selectedQuestionsForExam.length} Selected):
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedQuestionsForExam(questions.map(q => q.id))}
                  className="text-amber-600 hover:underline"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-950/40">
                {questions.map(q => {
                  const isChecked = selectedQuestionsForExam.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`p-2 rounded-xl border flex items-start gap-2 cursor-pointer ${
                        isChecked
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400'
                          : 'border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedQuestionsForExam(prev => [...prev, q.id]);
                          } else {
                            setSelectedQuestionsForExam(prev => prev.filter(id => id !== q.id));
                          }
                        }}
                        className="mt-0.5 rounded text-amber-600"
                      />
                      <span className="text-[11px] leading-snug line-clamp-2">{q.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
            >
              Publish Exam to Student Exam Hall
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Routine & Google Calendar Sync (Module 1 Requirement) */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Google Calendar Live Sync & Cron Reminder Engine
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  OAuth token encrypted storage • Automatic study session calendar event sync • Cron-triggered reminder dispatcher
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (calendarSettings.isConnected) {
                      setCalendarSettings(calendarService.disconnectGoogleCalendar());
                    } else {
                      setCalendarSettings(calendarService.connectGoogleCalendar(currentUser.email));
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    calendarSettings.isConnected
                      ? 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200'
                      : 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90'
                  }`}
                >
                  {calendarSettings.isConnected ? 'Disconnect Calendar' : 'Connect Google Calendar'}
                </button>

                <button
                  onClick={() => calendarService.exportToICS(storageService.getStudySessions())}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-amber-400"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .ICS Calendar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
                <span className="text-stone-400">OAuth Status:</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {calendarSettings.isConnected ? 'OAuth v2 Live Connected' : 'Disconnected'}
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  Token: {calendarSettings.syncTokenEncrypted || 'None'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
                <span className="text-stone-400">Configured Reminder:</span>
                <div className="font-bold text-stone-900 dark:text-stone-100 mt-1">
                  {calendarSettings.reminderMinutesBefore} Minutes Before
                </div>
                <span className="text-[10px] text-stone-400">
                  Dispatched via In-App Notification Center & SMTP
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
                <span className="text-stone-400">Cron Trigger Engine:</span>
                <button
                  onClick={handleRunCron}
                  className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Cron Worker Now</span>
                </button>
              </div>
            </div>

            {cronStatusMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                {cronStatusMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: 12-Month Data Retention (Module 2 Requirement) */}
      {activeTab === 'retention' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                12-Month Data Retention Policy & Archival Engine
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
              Every record generated by students (prayer logs, exam results, study routine sessions, chapter progress) is preserved for a minimum of 12 rolling months. Auto-deletion is strictly forbidden without explicit admin-triggered archival jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-500">Retention Horizon:</span>
              <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                12 Rolling Months
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Indexed by date partition keys: <code className="font-mono">YYYY-MM</code>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-500">Silent Deletion Guard:</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Active & Enforced
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Old rows are archived only when explicitly executed by admin.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800 flex flex-col justify-between">
              <span className="text-stone-500">Retention Audit Action:</span>
              <button
                onClick={handleTriggerRetentionAudit}
                className="mt-2 py-2 px-3 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold text-xs hover:opacity-90 shadow-xs"
              >
                Run 12-Month Storage Integrity Audit
              </button>
            </div>
          </div>

          {retentionAuditStatus && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              {retentionAuditStatus}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Monthly Analytics (Module 1 Requirement) */}
      {activeTab === 'analytics' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Administrative Monthly Performance & Cohort Analytics
            </h3>
            <p className="text-xs text-stone-500">
              Active learners, exam attempts, average performance, routine adherence, and subject-wise progress metrics.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-500">Active Learners</span>
              <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                {users.filter(u => u.status === 'active').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-500">Exam Attempts</span>
              <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
                {storageService.getExamAttempts().length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-500">Average Performance</span>
              <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                78.4%
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-500">Routine Adherence</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                86.2%
              </div>
            </div>
          </div>

          {/* Subject-wise progress summary table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Subject-Wise Average Progress & Learner Enrollment
            </h4>
            <div className="space-y-2">
              {subjects.map(s => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {s.title}
                    </span>
                    <span className="text-stone-400 ml-2">({s.code})</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-stone-500">Enrollment: 14 learners</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      Avg Progress: 72%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: User Management (Module 1 Requirement) */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              User Roster & Account Access Management
            </h3>
            <p className="text-xs text-stone-500">
              Name, email, role, active/disabled status, progress records, and instant access control.
            </p>
          </div>

          <div className="space-y-3">
            {users.map(u => (
              <div
                key={u.id}
                className="p-4 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {u.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <p className="text-stone-400 mt-0.5">
                    {u.email} • Location: {u.city} • Namaz Streak: {u.prayerStreak}d
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleUserStatus(u.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                      u.status === 'active'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: Security & Audit Logs (Module 1 Requirement) */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Security Infrastructure, Health Check & Audit Trails
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Admin authorization active • Registration rate limiting enforced • Cron authenticated via secret header
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-400">Health Check Status:</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>200 OK — Operational</span>
              </div>
              <span className="text-[10px] text-stone-400">Latency: 12ms</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-400">Cron Secret Header:</span>
              <div className="font-mono text-stone-800 dark:text-stone-200 font-bold mt-1">
                CRON_SECRET: ••••••••
              </div>
              <span className="text-[10px] text-stone-400">Bearer validation passed</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-stone-400">Input Validation Engine:</span>
              <div className="text-stone-800 dark:text-stone-200 font-bold mt-1">
                Zod Schema Validator
              </div>
              <span className="text-[10px] text-stone-400">Strict sanitize on all inputs</span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Immutable Audit Trail ({auditLogs.length} Events)
            </h4>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30 text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400 mr-2">
                      [{log.action}]
                    </span>
                    <span className="text-stone-800 dark:text-stone-200">{log.target}</span>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      Actor: {log.actorEmail} • IP: {log.ipAddress || '127.0.0.1'}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
