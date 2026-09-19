export type Role = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'disabled';
  avatarUrl?: string;
  createdAt: string;
  streakCount: number;
  prayerStreak: number;
  city: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface YouTubeClass {
  id: string;
  chapterId: string;
  title: string;
  url: string;
  videoId: string;
  instructor: string;
  channel: string;
  description: string;
  displayOrder: number;
  durationMinutes: number;
}

export interface StudyMaterial {
  id: string;
  chapterId: string;
  title: string;
  type: 'pdf' | 'link' | 'doc';
  url: string;
  fileSize?: string;
  mimeType?: string;
  uploadedAt: string;
  storageProvider: 'local' | 's3-r2';
  isExternal?: boolean;
}

export interface ChapterContentSection {
  id: string;
  title: string;
  body: string;
  keyTakeaways: string[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  displayOrder: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  sections: ChapterContentSection[];
  youtubeClasses: YouTubeClass[];
  materials: StudyMaterial[];
}

export interface Subject {
  id: string;
  title: string;
  code: string;
  category: 'General' | 'BCS Special' | 'Science' | 'Humanities' | 'Job Prep';
  description: string;
  iconName: string;
  color: string;
  chapterCount: number;
}

export interface Question {
  id: string;
  chapterId: string;
  subjectId: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answerIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
  difficulty: Difficulty;
  tags?: string[];
}

export type ExamType = 'weekly' | 'monthly' | 'chapter_quiz';

export interface Exam {
  id: string;
  title: string;
  type: ExamType;
  subjectId?: string;
  chapterId?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startDate: string;
  endDate: string;
  questionIds: string[];
  difficulty: Difficulty;
  instructions: string;
  isActive: boolean;
}

export interface ExamAnswer {
  questionId: string;
  selectedOption: number; // 0..3 or -1 if skipped
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  examType: ExamType;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  percentage: number;
  timeTakenMinutes: number;
  submittedAt: string; // ISO date
  monthKey: string; // e.g., '2026-09' for 12-month retention grouping
  answers: ExamAnswer[];
}

export interface PrayerLog {
  id: string;
  userId: string;
  date: string; // 'YYYY-MM-DD'
  monthKey: string; // 'YYYY-MM'
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  allCompleted: boolean;
  completedAt: {
    fajr?: string;
    dhuhr?: string;
    asr?: string;
    maghrib?: string;
    isha?: string;
  };
}

export interface PrayerTimesData {
  city: string;
  country: string;
  date: string;
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
  };
  source: 'aladhan_api' | 'default_dhaka';
}

export interface DailyAffairItem {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  sourceUrl: string;
  publishedDate: string; // 'YYYY-MM-DD'
  monthKey: string; // 'YYYY-MM'
  category: 'bangladesh' | 'international';
  isImportantForExam: boolean; // Flagged for BCS/competitive job prep
  examRelevanceNotes?: string;
  tags: string[];
  pinnedByAdmin?: boolean;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  chapterId: string;
  subjectTitle: string;
  chapterTitle: string;
  scheduledStartTime: string; // ISO
  scheduledEndTime: string;
  durationMinutes: number;
  isCompleted: boolean;
  actualDurationMinutes?: number;
  googleCalendarEventId?: string;
  googleCalendarSynced: boolean;
  notes?: string;
  date: string; // YYYY-MM-DD
  monthKey: string;
}

export interface ChapterProgress {
  userId: string;
  chapterId: string;
  isCompleted: boolean;
  progressPercent: number;
  lastStudiedAt: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'prayer' | 'study_routine' | 'reward' | 'exam' | 'system';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress?: string;
  status: 'success' | 'warning' | 'failed';
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: { row: number; reason: string; rawData?: string }[];
}
