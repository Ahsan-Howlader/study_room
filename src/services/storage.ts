import {
  User,
  Subject,
  Chapter,
  Question,
  Exam,
  ExamAttempt,
  PrayerLog,
  DailyAffairItem,
  StudySession,
  ChapterProgress,
  NotificationItem,
  AuditLog
} from '../types';

const STORAGE_KEYS = {
  USERS: 'study_room_users_v1',
  CURRENT_USER: 'study_room_current_user_v1',
  SUBJECTS: 'study_room_subjects_v1',
  CHAPTERS: 'study_room_chapters_v1',
  QUESTIONS: 'study_room_questions_v1',
  EXAMS: 'study_room_exams_v1',
  EXAM_ATTEMPTS: 'study_room_exam_attempts_v1',
  PRAYER_LOGS: 'study_room_prayer_logs_v1',
  DAILY_AFFAIRS: 'study_room_daily_affairs_v1',
  STUDY_SESSIONS: 'study_room_study_sessions_v1',
  CHAPTER_PROGRESS: 'study_room_chapter_progress_v1',
  NOTIFICATIONS: 'study_room_notifications_v1',
  AUDIT_LOGS: 'study_room_audit_logs_v1',
  CALENDAR_SETTINGS: 'study_room_calendar_settings_v1',
  THEME_MODE: 'study_room_theme_mode_v1',
};

// Helper to get past 12 month keys in 'YYYY-MM' format from reference date (Sept 2026)
export function getPast12MonthKeys(refDate: Date = new Date(2026, 8, 19)): string[] {
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }
  return months;
}

export function formatMonthLabel(monthKey: string): string {
  const [yyyy, mm] = monthKey.split('-');
  const date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

// Initial seed generators
function generateSeedSubjects(): Subject[] {
  return [
    {
      id: 'sub-1',
      title: 'Bangladesh Affairs',
      code: 'BD-101',
      category: 'BCS Special',
      description: 'Constitution, Liberation War of 1971, Economy, Geography, and National Heritage.',
      iconName: 'Flag',
      color: 'amber',
      chapterCount: 4,
    },
    {
      id: 'sub-2',
      title: 'International Affairs',
      code: 'INT-201',
      category: 'General',
      description: 'Global Geopolitics, UN Treaties, International Security, and Economic Alliances.',
      iconName: 'Globe',
      color: 'blue',
      chapterCount: 3,
    },
    {
      id: 'sub-3',
      title: 'General Science & Tech',
      code: 'SCI-301',
      category: 'Science',
      description: 'Physics fundamentals, Modern Computing, Climate Science, and Human Biology.',
      iconName: 'Atom',
      color: 'emerald',
      chapterCount: 3,
    },
    {
      id: 'sub-4',
      title: 'Mathematical Reasoning',
      code: 'MATH-401',
      category: 'Job Prep',
      description: 'Algebra, Profit-Loss, Percentage, Geometry, Probability, and Analytical Logic.',
      iconName: 'Calculator',
      color: 'indigo',
      chapterCount: 3,
    },
  ];
}

function generateSeedChapters(): Chapter[] {
  return [
    {
      id: 'chap-1-1',
      subjectId: 'sub-1',
      title: 'Liberation War of 1971 & Historic 7th March',
      description: 'Comprehensive timeline from 1952 Language Movement to the historic surrender on 16 December 1971.',
      displayOrder: 1,
      difficulty: 'Intermediate',
      estimatedMinutes: 45,
      sections: [
        {
          id: 'sec-1',
          title: 'The 7th March Address & Non-Cooperation',
          body: 'On March 7, 1971, Bangabandhu Sheikh Mujibur Rahman delivered his landmark speech at the Racecourse Ground (now Suhrawardy Udyan), famously declaring: "The struggle this time is the struggle for our emancipation; the struggle this time is the struggle for independence." Recognized by UNESCO in the Memory of the World Register, this address catalyzed unconditional mass resistance against Pakistani military rule.',
          keyTakeaways: [
            'UNESCO Memory of the World Register recognition (2017).',
            'Four preliminary conditions presented to Yahya Khan on military troop withdrawal.',
            'Direct instruction for civilian civil disobedience and sovereign taxation freeze.',
          ],
        },
        {
          id: 'sec-2',
          title: 'Operation Searchlight & Mujibnagar Government',
          body: 'Following the brutal Operation Searchlight launched by Pakistani forces on the night of March 25, 1971, the Mujibnagar Government was formally sworn in on April 17, 1971, at Baidyanathtala in Meherpur. Tajuddin Ahmad assumed the premiership while Syed Nazrul Islam served as acting president.',
          keyTakeaways: [
            'Proclamation of Independence drafted in Kolkata and read at Mujibnagar.',
            '11 Sectors established under Commander-in-Chief General M. A. G. Osmani.',
            'Crucial diplomatic recognition missions in New Delhi, London, and New York.',
          ],
        },
      ],
      youtubeClasses: [
        {
          id: 'yt-1',
          chapterId: 'chap-1-1',
          title: 'BCS Masterclass: Timeline of Liberation War 1971',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoId: 'dQw4w9WgXcQ',
          instructor: 'Dr. Rafiqul Islam',
          channel: 'BCS Gyan Academy',
          description: 'High-yield exam points, sector commanders, and critical treaty dates.',
          displayOrder: 1,
          durationMinutes: 38,
        },
      ],
      materials: [
        {
          id: 'mat-1',
          chapterId: 'chap-1-1',
          title: '1971 Liberation War Official Gazetted Chronology',
          type: 'pdf',
          url: 'https://example.com/materials/1971_chronology.pdf',
          fileSize: '4.2 MB',
          mimeType: 'application/pdf',
          uploadedAt: '2026-08-10',
          storageProvider: 's3-r2',
        },
        {
          id: 'mat-2',
          chapterId: 'chap-1-1',
          title: 'Liberation War Museum Digital Archives',
          type: 'link',
          url: 'https://www.liberationwarmuseumbd.org',
          isExternal: true,
          uploadedAt: '2026-08-12',
          storageProvider: 'local',
        },
      ],
    },
    {
      id: 'chap-1-2',
      subjectId: 'sub-1',
      title: 'Constitution of Bangladesh: Key Articles & Amendments',
      description: 'Fundamental rights, directive principles of state policy, and landmark constitutional amendments.',
      displayOrder: 2,
      difficulty: 'Advanced',
      estimatedMinutes: 50,
      sections: [
        {
          id: 'sec-1',
          title: 'Preamble & Four Fundamental Principles',
          body: 'Adopted on November 4, 1972, and taking effect on December 16, 1972, the Constitution of Bangladesh establishes Nationalism, Socialism, Democracy, and Secularism as foundational ideals under Article 8.',
          keyTakeaways: [
            'Article 7: Supremacy of the Constitution.',
            'Part III: Fundamental Rights (Articles 26 to 47A).',
            'Enforcement through writ petitions under Article 102.',
          ],
        },
      ],
      youtubeClasses: [
        {
          id: 'yt-2',
          chapterId: 'chap-1-2',
          title: 'Constitution Articles 1-50 Simplified for Job Aspirants',
          url: 'https://www.youtube.com/watch?v=e_04ZrNroTo',
          videoId: 'e_04ZrNroTo',
          instructor: 'Advocate Farhana Yasmin',
          channel: 'Legal Aspirants BD',
          description: 'A line-by-line review of Articles 1 to 47 with frequently asked exam MCQs.',
          displayOrder: 1,
          durationMinutes: 42,
        },
      ],
      materials: [
        {
          id: 'mat-3',
          chapterId: 'chap-1-2',
          title: 'Bangladesh Constitution Unabridged PDF (Ministry of Law)',
          type: 'pdf',
          url: 'https://example.com/materials/bd_constitution.pdf',
          fileSize: '3.1 MB',
          mimeType: 'application/pdf',
          uploadedAt: '2026-08-15',
          storageProvider: 's3-r2',
        },
      ],
    },
    {
      id: 'chap-2-1',
      subjectId: 'sub-2',
      title: 'United Nations System, Treaties & Bretton Woods',
      description: 'UN Principal Organs, Security Council veto powers, IMF, World Bank, and climate summits.',
      displayOrder: 1,
      difficulty: 'Intermediate',
      estimatedMinutes: 40,
      sections: [
        {
          id: 'sec-1',
          title: 'UN Charter and the P5 Security Dynamics',
          body: 'Established in 1945 in San Francisco, the United Nations operates with six principal organs. The Security Council consists of 15 members, with 5 permanent members (P5: USA, UK, France, Russia, China) possessing veto rights under Article 27.',
          keyTakeaways: [
            'UN General Assembly headquarters in New York; ICJ seated at The Hague.',
            'Bretton Woods Conference (1944) created the IBRD (World Bank) and IMF.',
            'UNCLOS: Exclusive Economic Zone (EEZ) defined as 200 nautical miles.',
          ],
        },
      ],
      youtubeClasses: [
        {
          id: 'yt-3',
          chapterId: 'chap-2-1',
          title: 'International Institutions & Global Summits 2026',
          url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
          videoId: 'kJQP7kiw5Fk',
          instructor: 'Prof. Tariq Mahmud',
          channel: 'Global Digest BD',
          description: 'Summary of G20, BRICS, ASEAN, SCO, and COP climate negotiations.',
          displayOrder: 1,
          durationMinutes: 35,
        },
      ],
      materials: [
        {
          id: 'mat-4',
          chapterId: 'chap-2-1',
          title: 'International Treaties & UN Conventions Digest',
          type: 'pdf',
          url: 'https://example.com/materials/un_digest.pdf',
          fileSize: '2.5 MB',
          mimeType: 'application/pdf',
          uploadedAt: '2026-08-20',
          storageProvider: 'local',
        },
      ],
    },
  ];
}

function generateSeedQuestions(): Question[] {
  return [
    {
      id: 'q-1',
      chapterId: 'chap-1-1',
      subjectId: 'sub-1',
      text: 'On which date was the historic 7th March speech by Bangabandhu included in the UNESCO Memory of the World Register?',
      optionA: '30 October 2017',
      optionB: '15 August 2018',
      optionC: '21 February 2016',
      optionD: '7 March 2015',
      answerIndex: 0,
      explanation: 'On October 30, 2017, UNESCO declared Bangabandhu Sheikh Mujibur Rahman’s historic 7th March 1971 speech as part of the world’s documentary heritage.',
      difficulty: 'Intermediate',
      tags: ['7th March', 'UNESCO', 'Liberation War'],
    },
    {
      id: 'q-2',
      chapterId: 'chap-1-1',
      subjectId: 'sub-1',
      text: 'Who was the Prime Minister of the wartime Mujibnagar Provisional Government of Bangladesh formed in 1971?',
      optionA: 'Syed Nazrul Islam',
      optionB: 'Tajuddin Ahmad',
      optionC: 'M. A. G. Osmani',
      optionD: 'A. H. M. Qamaruzzaman',
      answerIndex: 1,
      explanation: 'Tajuddin Ahmad served as the first Prime Minister of Bangladesh in the Mujibnagar Provisional Government sworn in on April 17, 1971.',
      difficulty: 'Beginner',
      tags: ['Mujibnagar', 'Cabinet', 'History'],
    },
    {
      id: 'q-3',
      chapterId: 'chap-1-1',
      subjectId: 'sub-1',
      text: 'How many operational military sectors was Bangladesh divided into during the 1971 Liberation War?',
      optionA: '8 Sectors',
      optionB: '10 Sectors',
      optionC: '11 Sectors',
      optionD: '14 Sectors',
      answerIndex: 2,
      explanation: 'The entire geographic area of Bangladesh was partitioned into 11 military sectors headed by designated Sector Commanders.',
      difficulty: 'Beginner',
      tags: ['Sectors', 'Mukti Bahini'],
    },
    {
      id: 'q-4',
      chapterId: 'chap-1-2',
      subjectId: 'sub-1',
      text: 'Which Article of the Constitution of Bangladesh guarantees the right to freedom of speech, expression, and thought?',
      optionA: 'Article 27',
      optionB: 'Article 32',
      optionC: 'Article 39',
      optionD: 'Article 42',
      answerIndex: 2,
      explanation: 'Article 39 guarantees freedom of thought and conscience, and of speech, subject to reasonable restrictions imposed by law.',
      difficulty: 'Intermediate',
      tags: ['Constitution', 'Fundamental Rights'],
    },
    {
      id: 'q-5',
      chapterId: 'chap-1-2',
      subjectId: 'sub-1',
      text: 'Under which Article of the Bangladesh Constitution may the High Court Division issue Writs for the enforcement of fundamental rights?',
      optionA: 'Article 44',
      optionB: 'Article 102',
      optionC: 'Article 117',
      optionD: 'Article 137',
      answerIndex: 1,
      explanation: 'Article 102 empowers the High Court Division to issue directions or orders in the nature of writs of habeas corpus, mandamus, prohibition, quo warranto, and certiorari.',
      difficulty: 'Advanced',
      tags: ['Writ', 'Judiciary', 'Constitution'],
    },
    {
      id: 'q-6',
      chapterId: 'chap-2-1',
      subjectId: 'sub-2',
      text: 'Where is the official permanent seat of the International Court of Justice (ICJ) located?',
      optionA: 'Geneva, Switzerland',
      optionB: 'New York, USA',
      optionC: 'The Hague, Netherlands',
      optionD: 'Vienna, Austria',
      answerIndex: 2,
      explanation: 'The International Court of Justice (ICJ), the principal judicial organ of the UN, sits at the Peace Palace in The Hague, Netherlands.',
      difficulty: 'Beginner',
      tags: ['UN', 'ICJ', 'Law'],
    },
    {
      id: 'q-7',
      chapterId: 'chap-2-1',
      subjectId: 'sub-2',
      text: 'According to the United Nations Convention on the Law of the Sea (UNCLOS), an Exclusive Economic Zone (EEZ) extends up to:',
      optionA: '12 nautical miles',
      optionB: '24 nautical miles',
      optionC: '200 nautical miles',
      optionD: '350 nautical miles',
      answerIndex: 2,
      explanation: 'Under UNCLOS, territorial sea is 12 nautical miles, contiguous zone is 24 nm, and the Exclusive Economic Zone (EEZ) extends up to 200 nautical miles.',
      difficulty: 'Intermediate',
      tags: ['UNCLOS', 'Maritime', 'Geography'],
    },
  ];
}

function generateSeedExams(): Exam[] {
  return [
    {
      id: 'exam-w-1',
      title: 'Weekly Assessment 38: Bangladesh Affairs & Constitutional Articles',
      type: 'weekly',
      subjectId: 'sub-1',
      durationMinutes: 15,
      totalMarks: 25,
      passingMarks: 15,
      startDate: '2026-09-14',
      endDate: '2026-09-21',
      questionIds: ['q-1', 'q-2', 'q-3', 'q-4', 'q-5'],
      difficulty: 'Intermediate',
      instructions: 'Standard negative marking applies (-0.25 per incorrect answer). Read questions carefully and submit before the timer expires.',
      isActive: true,
    },
    {
      id: 'exam-m-1',
      title: 'Monthly Mock Exam: September 2026 BCS Model Test',
      type: 'monthly',
      durationMinutes: 30,
      totalMarks: 50,
      passingMarks: 30,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      questionIds: ['q-1', 'q-2', 'q-3', 'q-4', 'q-5', 'q-6', 'q-7'],
      difficulty: 'Advanced',
      instructions: 'Comprehensive multi-subject exam covering Bangladesh & International Affairs. Realistic examination condition with time limits.',
      isActive: true,
    },
  ];
}

// 12-Month Seed generator for historical analytics & reports
function generate12MonthPrayerLogs(userId: string): PrayerLog[] {
  const logs: PrayerLog[] = [];
  const monthKeys = getPast12MonthKeys(new Date(2026, 8, 19)); // Sep 2026 down to Oct 2025

  monthKeys.forEach((monthKey, mIdx) => {
    const [y, m] = monthKey.split('-').map(Number);
    // Number of days in this month
    const daysInMonth = new Date(y, m, 0).getDate();

    // For current month (Sep 2026), log up to the 19th
    const limitDay = mIdx === 0 ? 19 : daysInMonth;

    for (let day = 1; day <= limitDay; day++) {
      const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
      // High adherence pattern (80-95% completed)
      const seedVal = (day * 13 + m * 7) % 100;
      const fajr = seedVal > 15;
      const dhuhr = seedVal > 10;
      const asr = seedVal > 12;
      const maghrib = seedVal > 8;
      const isha = seedVal > 14;
      const allCompleted = fajr && dhuhr && asr && maghrib && isha;

      logs.push({
        id: `pr-${userId}-${dateStr}`,
        userId,
        date: dateStr,
        monthKey,
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
        allCompleted,
        completedAt: {
          fajr: fajr ? '05:12 AM' : undefined,
          dhuhr: dhuhr ? '01:18 PM' : undefined,
          asr: asr ? '04:35 PM' : undefined,
          maghrib: maghrib ? '06:14 PM' : undefined,
          isha: isha ? '07:42 PM' : undefined,
        },
      });
    }
  });

  return logs;
}

function generate12MonthExamAttempts(userId: string): ExamAttempt[] {
  const attempts: ExamAttempt[] = [];
  const monthKeys = getPast12MonthKeys(new Date(2026, 8, 19));

  monthKeys.forEach((monthKey, idx) => {
    // 2-3 exams per month
    const examDate1 = `${monthKey}-08`;
    const examDate2 = `${monthKey}-22`;
    const baseScore = 70 + (11 - idx) * 2; // Upward score trend towards Sep 2026!

    attempts.push({
      id: `att-${monthKey}-1`,
      examId: 'exam-w-1',
      examTitle: `Weekly Assessment (${formatMonthLabel(monthKey)})`,
      examType: 'weekly',
      userId,
      userName: 'Ahsan Howlader',
      score: Math.min(95, baseScore + (idx % 3)),
      totalQuestions: 20,
      correctCount: Math.round(20 * (baseScore / 100)),
      incorrectCount: 20 - Math.round(20 * (baseScore / 100)),
      skippedCount: 0,
      percentage: Math.min(95, baseScore + (idx % 3)),
      timeTakenMinutes: 12,
      submittedAt: `${examDate1}T10:45:00Z`,
      monthKey,
      answers: [],
    });

    if (idx > 0) {
      attempts.push({
        id: `att-${monthKey}-2`,
        examId: 'exam-m-1',
        examTitle: `Monthly Grand Test (${formatMonthLabel(monthKey)})`,
        examType: 'monthly',
        userId,
        userName: 'Ahsan Howlader',
        score: Math.min(96, baseScore + 4),
        totalQuestions: 50,
        correctCount: Math.round(50 * ((baseScore + 4) / 100)),
        incorrectCount: 50 - Math.round(50 * ((baseScore + 4) / 100)),
        skippedCount: 0,
        percentage: Math.min(96, baseScore + 4),
        timeTakenMinutes: 26,
        submittedAt: `${examDate2}T14:30:00Z`,
        monthKey,
        answers: [],
      });
    }
  });

  return attempts;
}

function generate12MonthStudySessions(userId: string): StudySession[] {
  const sessions: StudySession[] = [];
  const monthKeys = getPast12MonthKeys(new Date(2026, 8, 19));

  monthKeys.forEach((monthKey, mIdx) => {
    const limitDay = mIdx === 0 ? 19 : 28;
    for (let d = 1; d <= limitDay; d += 2) {
      const dateStr = `${monthKey}-${String(d).padStart(2, '0')}`;
      sessions.push({
        id: `sess-${dateStr}`,
        userId,
        subjectId: d % 2 === 0 ? 'sub-1' : 'sub-2',
        chapterId: d % 2 === 0 ? 'chap-1-1' : 'chap-2-1',
        subjectTitle: d % 2 === 0 ? 'Bangladesh Affairs' : 'International Affairs',
        chapterTitle: d % 2 === 0 ? 'Liberation War of 1971' : 'United Nations System',
        scheduledStartTime: `${dateStr}T10:00:00Z`,
        scheduledEndTime: `${dateStr}T11:00:00Z`,
        durationMinutes: 60,
        isCompleted: true,
        actualDurationMinutes: 55,
        googleCalendarSynced: true,
        date: dateStr,
        monthKey,
      });
    }
  });

  return sessions;
}

function generateSeedDailyAffairs(): DailyAffairItem[] {
  return [
    {
      id: 'da-1',
      title: 'Bangladesh Bank Unveils Foreign Reserve Stabilization Framework',
      excerpt: 'The central bank of Bangladesh announced revised crawling peg band adjustments and enhanced export repatriation oversight to bolster net foreign exchange reserves.',
      source: 'The Daily Star',
      sourceUrl: 'https://www.thedailystar.net/business/economy',
      publishedDate: '2026-09-18',
      monthKey: '2026-09',
      category: 'bangladesh',
      isImportantForExam: true,
      examRelevanceNotes: 'Crucial for BCS Written Economics & Monetary Policy questions. Note the Crawling Peg mechanism definition.',
      tags: ['Economy', 'Bangladesh Bank', 'Forex', 'BCS High-Yield'],
      pinnedByAdmin: true,
    },
    {
      id: 'da-2',
      title: 'Dhaka-Chattogram High-Speed Rail Feasibility Study Approved by ECNEC',
      excerpt: 'The Executive Committee of the National Economic Council (ECNEC) approved revised financing models for nationwide high-efficiency rail connectivity corridors.',
      source: 'Financial Express Bangladesh',
      sourceUrl: 'https://thefinancialexpress.com.bd/economy',
      publishedDate: '2026-09-17',
      monthKey: '2026-09',
      category: 'bangladesh',
      isImportantForExam: true,
      examRelevanceNotes: 'Key infrastructure megaprojects topic. Know ECNEC chairperson (Prime Minister/Chief Advisor).',
      tags: ['Infrastructure', 'ECNEC', 'Megaproject'],
      pinnedByAdmin: false,
    },
    {
      id: 'da-3',
      title: 'UN General Assembly 81st Session Opens with Focus on Global AI Treaty',
      excerpt: 'World leaders gathered in New York as deliberations began on establishing the International AI Safety Secretariat under the auspices of the UN framework.',
      source: 'Reuters / UN News',
      sourceUrl: 'https://www.reuters.com/world',
      publishedDate: '2026-09-16',
      monthKey: '2026-09',
      category: 'international',
      isImportantForExam: true,
      examRelevanceNotes: 'International Affairs syllabus: UN special conventions and governance of emerging technologies.',
      tags: ['UN', 'Global Governance', 'Technology', 'Treaties'],
      pinnedByAdmin: true,
    },
    {
      id: 'da-4',
      title: 'BRICS Summit Finalizes New Multilateral Currency Clearing Network',
      excerpt: 'Finance ministers announced operationalization of non-dollar bilateral settlement infrastructure across member states during the annual plenary summit.',
      source: 'BBC World',
      sourceUrl: 'https://www.bbc.com/news/world',
      publishedDate: '2026-09-15',
      monthKey: '2026-09',
      category: 'international',
      isImportantForExam: true,
      examRelevanceNotes: 'De-dollarization trends and New Development Bank (NDB) governance.',
      tags: ['BRICS', 'Geopolitics', 'Global South'],
      pinnedByAdmin: false,
    },
    {
      id: 'da-5',
      title: 'National Seed Bank and Drought-Resistant Paddy Varieties Recognized by FAO',
      excerpt: 'The UN Food and Agriculture Organization commended Bangladesh Agricultural Research Institute (BARI) for salinity-tolerant rice genomes.',
      source: 'Prothom Alo English',
      sourceUrl: 'https://en.prothomalo.com/bangladesh',
      publishedDate: '2026-08-28',
      monthKey: '2026-08',
      category: 'bangladesh',
      isImportantForExam: false,
      examRelevanceNotes: 'General Science & Agriculture in Bangladesh.',
      tags: ['Agriculture', 'FAO', 'Science'],
      pinnedByAdmin: false,
    },
    {
      id: 'da-6',
      title: 'International Maritime Organization Tightens Green Shipping Emission Caps',
      excerpt: 'New Net-Zero 2050 benchmarks enacted for deep-sea cargo vessels crossing international strait checkpoints.',
      source: 'Al Jazeera',
      sourceUrl: 'https://www.aljazeera.com/economy',
      publishedDate: '2026-08-14',
      monthKey: '2026-08',
      category: 'international',
      isImportantForExam: true,
      examRelevanceNotes: 'Climate agreements, IMO mandates, and environmental treaties.',
      tags: ['Climate', 'Maritime', 'IMO'],
      pinnedByAdmin: false,
    },
  ];
}

// Storage Manager
export const storageService = {
  // Current User
  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const defaultUser: User = {
      id: 'usr-ahsan',
      name: 'Ahsan Howlader',
      email: 'howladerahsan@gmail.com',
      role: 'student', // toggleable between 'student' and 'admin'
      status: 'active',
      createdAt: '2025-08-01',
      streakCount: 18,
      prayerStreak: 14,
      city: 'Dhaka',
    };
    this.saveCurrentUser(defaultUser);
    return defaultUser;
  },

  saveCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Users List (for Admin Management)
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed: User[] = [
      {
        id: 'usr-ahsan',
        name: 'Ahsan Howlader',
        email: 'howladerahsan@gmail.com',
        role: 'admin',
        status: 'active',
        createdAt: '2025-08-01',
        streakCount: 18,
        prayerStreak: 14,
        city: 'Dhaka',
      },
      {
        id: 'usr-student-1',
        name: 'Nusrat Jahan',
        email: 'nusrat.jahan@example.com',
        role: 'student',
        status: 'active',
        createdAt: '2025-09-10',
        streakCount: 12,
        prayerStreak: 9,
        city: 'Chattogram',
      },
      {
        id: 'usr-student-2',
        name: 'Tanvir Hossain',
        email: 'tanvir.hossain@example.com',
        role: 'student',
        status: 'active',
        createdAt: '2025-10-04',
        streakCount: 22,
        prayerStreak: 18,
        city: 'Sylhet',
      },
      {
        id: 'usr-student-3',
        name: 'Fariha Rahman',
        email: 'fariha.rahman@example.com',
        role: 'student',
        status: 'disabled',
        createdAt: '2025-11-15',
        streakCount: 0,
        prayerStreak: 0,
        city: 'Rajshahi',
      },
    ];
    this.saveUsers(seed);
    return seed;
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Subjects
  getSubjects(): Subject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed = generateSeedSubjects();
    this.saveSubjects(seed);
    return seed;
  },

  saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  // Chapters
  getChapters(): Chapter[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed = generateSeedChapters();
    this.saveChapters(seed);
    return seed;
  },

  saveChapters(chapters: Chapter[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  },

  // Questions
  getQuestions(): Question[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed = generateSeedQuestions();
    this.saveQuestions(seed);
    return seed;
  },

  saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  // Exams
  getExams(): Exam[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed = generateSeedExams();
    this.saveExams(seed);
    return seed;
  },

  saveExams(exams: Exam[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  // Exam Attempts (12-Month Rolling Retention)
  getExamAttempts(userId?: string): ExamAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_ATTEMPTS);
    let attempts: ExamAttempt[] = [];
    if (raw) {
      try {
        attempts = JSON.parse(raw);
      } catch {
        // fallback
      }
    } else {
      attempts = generate12MonthExamAttempts('usr-ahsan');
      this.saveExamAttempts(attempts);
    }
    return userId ? attempts.filter(a => a.userId === userId) : attempts;
  },

  saveExamAttempts(attempts: ExamAttempt[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAM_ATTEMPTS, JSON.stringify(attempts));
  },

  addExamAttempt(attempt: ExamAttempt): void {
    const current = this.getExamAttempts();
    current.unshift(attempt);
    this.saveExamAttempts(current);
  },

  // Prayer Logs (12-Month Rolling Retention)
  getPrayerLogs(userId: string): PrayerLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRAYER_LOGS);
    let logs: PrayerLog[] = [];
    if (raw) {
      try {
        logs = JSON.parse(raw);
      } catch {
        // fallback
      }
    } else {
      logs = generate12MonthPrayerLogs(userId);
      this.savePrayerLogs(logs);
    }
    return logs.filter(l => l.userId === userId);
  },

  savePrayerLogs(logs: PrayerLog[]): void {
    localStorage.setItem(STORAGE_KEYS.PRAYER_LOGS, JSON.stringify(logs));
  },

  getPrayerLogForDate(userId: string, dateStr: string): PrayerLog {
    const all = this.getPrayerLogs(userId);
    const existing = all.find(l => l.date === dateStr);
    if (existing) return existing;

    const monthKey = dateStr.slice(0, 7);
    const newLog: PrayerLog = {
      id: `pr-${userId}-${dateStr}`,
      userId,
      date: dateStr,
      monthKey,
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
      allCompleted: false,
      completedAt: {},
    };
    all.unshift(newLog);
    this.savePrayerLogs(all);
    return newLog;
  },

  updatePrayerStatus(
    userId: string,
    dateStr: string,
    prayerKey: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    status: boolean
  ): { log: PrayerLog; newlyCompletedAll: boolean } {
    const all = this.getPrayerLogs(userId);
    let target = all.find(l => l.date === dateStr);
    if (!target) {
      target = this.getPrayerLogForDate(userId, dateStr);
      all.unshift(target);
    }

    const wasAllDone = target.allCompleted;
    target[prayerKey] = status;

    if (status) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      target.completedAt[prayerKey] = timeStr;
    } else {
      delete target.completedAt[prayerKey];
    }

    target.allCompleted = Boolean(
      target.fajr && target.dhuhr && target.asr && target.maghrib && target.isha
    );

    const newlyCompletedAll = !wasAllDone && target.allCompleted;

    // Persist
    const updated = all.map(l => (l.date === dateStr ? target! : l));
    this.savePrayerLogs(updated);

    // Update user streak if today
    if (newlyCompletedAll) {
      const currentUser = this.getCurrentUser();
      currentUser.prayerStreak += 1;
      this.saveCurrentUser(currentUser);
    }

    return { log: target, newlyCompletedAll };
  },

  // Daily Affairs
  getDailyAffairs(): DailyAffairItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_AFFAIRS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed = generateSeedDailyAffairs();
    this.saveDailyAffairs(seed);
    return seed;
  },

  saveDailyAffairs(items: DailyAffairItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DAILY_AFFAIRS, JSON.stringify(items));
  },

  // Study Sessions
  getStudySessions(userId?: string): StudySession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
    let sessions: StudySession[] = [];
    if (raw) {
      try {
        sessions = JSON.parse(raw);
      } catch {
        // fallback
      }
    } else {
      sessions = generate12MonthStudySessions('usr-ahsan');
      this.saveStudySessions(sessions);
    }
    return userId ? sessions.filter(s => s.userId === userId) : sessions;
  },

  saveStudySessions(sessions: StudySession[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
  },

  addStudySession(session: StudySession): void {
    const current = this.getStudySessions();
    current.unshift(session);
    this.saveStudySessions(current);
  },

  deleteStudySession(id: string): void {
    const current = this.getStudySessions().filter(s => s.id !== id);
    this.saveStudySessions(current);
  },

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed: NotificationItem[] = [
      {
        id: 'notif-1',
        userId,
        title: 'Asr Prayer Reminder',
        message: 'Asr prayer time begins in 15 minutes (04:15 PM). Take a calming pause in your study.',
        type: 'prayer',
        timestamp: '2026-09-19T04:00:00Z',
        isRead: false,
      },
      {
        id: 'notif-2',
        userId,
        title: 'Weekly Exam Live!',
        message: 'Weekly Assessment 38: Bangladesh Affairs is now open. Test your readiness.',
        type: 'exam',
        timestamp: '2026-09-18T14:30:00Z',
        isRead: false,
      },
      {
        id: 'notif-3',
        userId,
        title: 'Daily Streak Milestone',
        message: '18 consecutive study days logged. Your discipline is steady and calm.',
        type: 'reward',
        timestamp: '2026-09-17T20:00:00Z',
        isRead: true,
      },
    ];
    this.saveNotifications(seed);
    return seed;
  },

  saveNotifications(notifs: NotificationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  addNotification(notif: NotificationItem): void {
    const current = this.getNotifications(notif.userId);
    current.unshift(notif);
    this.saveNotifications(current);
  },

  // Audit Logs (Module 1 Security & Auditing)
  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed: AuditLog[] = [
      {
        id: 'aud-1',
        actorEmail: 'howladerahsan@gmail.com',
        action: 'QUESTION_BANK_IMPORT',
        target: '40 Questions imported into BCS Special',
        timestamp: '2026-09-18 16:30:12',
        ipAddress: '103.205.71.12',
        status: 'success',
      },
      {
        id: 'aud-2',
        actorEmail: 'howladerahsan@gmail.com',
        action: 'EXAM_CREATED',
        target: 'Weekly Assessment 38',
        timestamp: '2026-09-17 11:20:05',
        ipAddress: '103.205.71.12',
        status: 'success',
      },
      {
        id: 'aud-3',
        actorEmail: 'system-cron',
        action: 'STUDY_REMINDER_TRIGGER',
        target: 'Routine reminder sent to 14 active learners',
        timestamp: '2026-09-19 04:00:00',
        ipAddress: '127.0.0.1',
        status: 'success',
      },
    ];
    this.saveAuditLogs(seed);
    return seed;
  },

  saveAuditLogs(logs: AuditLog[]): void {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  addAuditLog(actorEmail: string, action: string, target: string, status: 'success' | 'warning' | 'failed' = 'success'): void {
    const current = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorEmail,
      action,
      target,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipAddress: 'Client-Session',
      status,
    };
    current.unshift(newLog);
    this.saveAuditLogs(current.slice(0, 100)); // Keep latest 100
  },

  // Chapter Progress
  getChapterProgress(userId: string): Record<string, ChapterProgress> {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAPTER_PROGRESS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const seed: Record<string, ChapterProgress> = {
      'chap-1-1': {
        userId,
        chapterId: 'chap-1-1',
        isCompleted: true,
        progressPercent: 100,
        lastStudiedAt: '2026-09-18T15:20:00Z',
      },
      'chap-1-2': {
        userId,
        chapterId: 'chap-1-2',
        isCompleted: false,
        progressPercent: 65,
        lastStudiedAt: '2026-09-19T02:10:00Z',
      },
      'chap-2-1': {
        userId,
        chapterId: 'chap-2-1',
        isCompleted: true,
        progressPercent: 100,
        lastStudiedAt: '2026-09-16T11:00:00Z',
      },
    };
    localStorage.setItem(STORAGE_KEYS.CHAPTER_PROGRESS, JSON.stringify(seed));
    return seed;
  },

  saveChapterProgress(progress: Record<string, ChapterProgress>): void {
    localStorage.setItem(STORAGE_KEYS.CHAPTER_PROGRESS, JSON.stringify(progress));
  },

  updateChapterProgress(userId: string, chapterId: string, percent: number, completed: boolean): void {
    const map = this.getChapterProgress(userId);
    map[chapterId] = {
      userId,
      chapterId,
      progressPercent: percent,
      isCompleted: completed,
      lastStudiedAt: new Date().toISOString(),
    };
    this.saveChapterProgress(map);
  },

  // Full reset/re-seed tool for demo & verification
  resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  },
};
