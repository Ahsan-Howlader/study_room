import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { SubjectCatalog } from './components/study/SubjectCatalog';
import { ChapterReader } from './components/study/ChapterReader';
import { PrayerTrackerView } from './components/prayer/PrayerTrackerView';
import { ExamListView } from './components/exams/ExamListView';
import { DailyAffairsView } from './components/affairs/DailyAffairsView';
import { AdminCMS } from './components/admin/AdminCMS';
import { storageService } from './services/storage';
import { User, Subject, Chapter } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'chapters' | 'exams' | 'prayer' | 'affairs' | 'admin'
  >('dashboard');

  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [subjects, setSubjects] = useState<Subject[]>(() => storageService.getSubjects());
  const [chapters, setChapters] = useState<Chapter[]>(() => storageService.getChapters());

  // Active reading chapter (if any)
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('study_room_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('study_room_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('study_room_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleUserUpdate = (updated: User) => {
    setCurrentUser(updated);
    storageService.saveCurrentUser(updated);
  };

  const handleSelectChapter = (chapter: Chapter, subject: Subject) => {
    setActiveChapter(chapter);
    setActiveSubject(subject);
    setActiveTab('chapters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setActiveChapter(null);
    setActiveSubject(null);
  };

  const refreshAppData = () => {
    setSubjects(storageService.getSubjects());
    setChapters(storageService.getChapters());
    setCurrentUser(storageService.getCurrentUser());
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] dark:bg-[#151311] text-stone-900 dark:text-stone-100 selection:bg-amber-200 selection:text-amber-900 font-sans transition-colors duration-200">
      {/* Global Navigation Header with Streak counters and Notifications */}
      <Header
        currentTab={activeTab}
        onTabChange={(tab: 'dashboard' | 'chapters' | 'exams' | 'prayer' | 'affairs' | 'admin') => {
          setActiveTab(tab);
          if (tab !== 'chapters') {
            setActiveChapter(null);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <StudentDashboard
            currentUser={currentUser}
            onUserUpdate={handleUserUpdate}
            subjects={subjects}
            chapters={chapters}
            onNavigate={setActiveTab}
            onSelectChapter={handleSelectChapter}
          />
        )}

        {activeTab === 'chapters' && (
          <>
            {activeChapter && activeSubject ? (
              <ChapterReader
                chapter={activeChapter}
                subject={activeSubject}
                userId={currentUser.id}
                onBack={handleBackToCatalog}
              />
            ) : (
              <SubjectCatalog
                subjects={subjects}
                chapters={chapters}
                userId={currentUser.id}
                onSelectChapter={handleSelectChapter}
              />
            )}
          </>
        )}

        {activeTab === 'exams' && (
          <ExamListView currentUser={currentUser} onUserUpdate={handleUserUpdate} />
        )}

        {activeTab === 'prayer' && (
          <PrayerTrackerView currentUser={currentUser} onUserUpdate={handleUserUpdate} />
        )}

        {activeTab === 'affairs' && <DailyAffairsView currentUser={currentUser} />}

        {activeTab === 'admin' && (
          <AdminCMS
            currentUser={currentUser}
            onUserUpdate={handleUserUpdate}
            subjects={subjects}
            chapters={chapters}
            onDataChange={refreshAppData}
          />
        )}
      </main>

      {/* Global Mandatory Footer (Must appear on every page: Created by Ahsan) */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
}
