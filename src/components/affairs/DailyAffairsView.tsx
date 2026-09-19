import React, { useState } from 'react';
import {
  ExternalLink,
  Search,
  Sparkles,
  Pin,
  Calendar,
  Globe,
  Flag,
  Bookmark,
  Plus,
  Tag,
  CheckCircle,
  Filter
} from 'lucide-react';
import { DailyAffairItem, User } from '../../types';
import {
  storageService,
  getPast12MonthKeys,
  formatMonthLabel
} from '../../services/storage';

interface DailyAffairsViewProps {
  currentUser: User;
}

export const DailyAffairsView: React.FC<DailyAffairsViewProps> = ({ currentUser }) => {
  const [items, setItems] = useState<DailyAffairItem[]>(() =>
    storageService.getDailyAffairs()
  );
  const [activeTab, setActiveTab] = useState<'all' | 'bangladesh' | 'international' | 'exam_highlights'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 12-Month retention archive selector (Module 2 & 5 requirement)
  const past12Months = getPast12MonthKeys(new Date(2026, 8, 19));
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all');

  // New Item Creator Modal (for Admin curation)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemExcerpt, setNewItemExcerpt] = useState('');
  const [newItemSource, setNewItemSource] = useState('The Daily Star');
  const [newItemUrl, setNewItemUrl] = useState('https://www.thedailystar.net');
  const [newItemCategory, setNewItemCategory] = useState<'bangladesh' | 'international'>('bangladesh');
  const [newItemIsImportant, setNewItemIsImportant] = useState(true);
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemTags, setNewItemTags] = useState('BCS Special, Economy, High-Yield');

  const filteredItems = items.filter(item => {
    // Tab filter
    if (activeTab === 'bangladesh' && item.category !== 'bangladesh') return false;
    if (activeTab === 'international' && item.category !== 'international') return false;
    if (activeTab === 'exam_highlights' && !item.isImportantForExam) return false;

    // Month filter
    if (selectedMonthKey !== 'all' && item.monthKey !== selectedMonthKey) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchExcerpt = item.excerpt.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchExcerpt && !matchTags) return false;
    }

    return true;
  });

  const handleTogglePin = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, pinnedByAdmin: !item.pinnedByAdmin } : item
    );
    setItems(updated);
    storageService.saveDailyAffairs(updated);
  };

  const handleToggleHighlight = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, isImportantForExam: !item.isImportantForExam } : item
    );
    setItems(updated);
    storageService.saveDailyAffairs(updated);
  };

  const handleCreateNewsItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemExcerpt) return;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const monthKey = dateStr.slice(0, 7);

    const created: DailyAffairItem = {
      id: `da-${Date.now()}`,
      title: newItemTitle,
      excerpt: newItemExcerpt,
      source: newItemSource,
      sourceUrl: newItemUrl,
      publishedDate: dateStr,
      monthKey,
      category: newItemCategory,
      isImportantForExam: newItemIsImportant,
      examRelevanceNotes: newItemNotes || 'Curated exam preparation point.',
      tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean),
      pinnedByAdmin: true,
    };

    const nextList = [created, ...items];
    setItems(nextList);
    storageService.saveDailyAffairs(nextList);
    storageService.addAuditLog(
      currentUser.email,
      'DAILY_AFFAIRS_CURATED',
      `Curated news item "${newItemTitle.slice(0, 40)}" added with exam relevance.`,
      'success'
    );

    setShowAddModal(false);
    setNewItemTitle('');
    setNewItemExcerpt('');
    setNewItemNotes('');
  };

  const examHighlightsCount = items.filter(i => i.isImportantForExam).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Daily Affairs & Exam Digest
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
              12-Month Searchable Archive
            </span>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Curated headlines and high-yield competitive exam current affairs from verified national & international outlets.
          </p>
        </div>

        {/* Curate item button for Admin or proactive students */}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold shadow-xs hover:opacity-90 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Curate New Item</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors ${
              activeTab === 'all'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            All Digest Items
          </button>
          <button
            onClick={() => setActiveTab('exam_highlights')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-colors ${
              activeTab === 'exam_highlights'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>BCS / Job Highlights ({examHighlightsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('bangladesh')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-colors ${
              activeTab === 'bangladesh'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Bangladesh Outlets</span>
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-colors ${
              activeTab === 'international'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>International Outlets</span>
          </button>
        </div>

        {/* Search & 12-Month Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Keyword Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search keyword or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* 12-Month Retention Archive Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
            <span className="text-stone-500 whitespace-nowrap">Archive:</span>
            <select
              value={selectedMonthKey}
              onChange={e => setSelectedMonthKey(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All 12 Months</option>
              {past12Months.map(mKey => (
                <option key={mKey} value={mKey}>
                  {formatMonthLabel(mKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* News Digest Feed List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-500">
            No daily affairs items match your search or filter criteria.
          </div>
        ) : (
          filteredItems.map(item => (
            <article
              key={item.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                item.pinnedByAdmin
                  ? 'bg-amber-50/40 dark:bg-stone-900/80 border-amber-300/80 dark:border-amber-800/60 shadow-xs'
                  : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800/80 shadow-xs hover:border-amber-400'
              }`}
            >
              <div>
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        item.category === 'bangladesh'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {item.category === 'bangladesh' ? 'Bangladesh News' : 'International News'}
                    </span>

                    {item.isImportantForExam && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        BCS High-Yield
                      </span>
                    )}

                    {item.pinnedByAdmin && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                        <Pin className="w-3 h-3 rotate-45" />
                        Pinned by Admin
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-stone-400 font-mono">
                    Published: {item.publishedDate}
                  </span>
                </div>

                {/* Title & Excerpt (Strictly headlines + short excerpt honoring fair use) */}
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {item.title}
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                  {item.excerpt}
                </p>

                {/* Exam Relevance Callout */}
                {item.examRelevanceNotes && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-xs">
                    <span className="font-semibold text-amber-900 dark:text-amber-300">
                      Why it matters for competitive exams:{' '}
                    </span>
                    <span className="text-stone-700 dark:text-stone-300">
                      {item.examRelevanceNotes}
                    </span>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {item.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Source link & Admin controls */}
              <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400">Source:</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    {item.source}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium ml-2"
                  >
                    <span>Read Full Article on Outlet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Admin Curation toggles */}
                {currentUser.role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(item.id)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                        item.pinnedByAdmin
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'border-stone-200 text-stone-500 hover:text-stone-800'
                      }`}
                      title="Pin item to top"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{item.pinnedByAdmin ? 'Pinned' : 'Pin'}</span>
                    </button>
                    <button
                      onClick={() => handleToggleHighlight(item.id)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                        item.isImportantForExam
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'border-stone-200 text-stone-500 hover:text-stone-800'
                      }`}
                      title="Flag as important for BCS/Job exams"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{item.isImportantForExam ? 'High-Yield' : 'Mark Exam Prep'}</span>
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Admin Curate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
              Curate Daily Affairs Digest Item
            </h3>
            <form onSubmit={handleCreateNewsItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangladesh signs bilateral transit treaty..."
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Short Excerpt (Fair use brief summary)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief synopsis summarizing key developments..."
                  value={newItemExcerpt}
                  onChange={e => setNewItemExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    News Outlet / Source
                  </label>
                  <input
                    type="text"
                    value={newItemSource}
                    onChange={e => setNewItemSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as 'bangladesh' | 'international')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="bangladesh">Bangladesh Outlets</option>
                    <option value="international">International Outlets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  Original Source URL (Full Link)
                </label>
                <input
                  type="url"
                  value={newItemUrl}
                  onChange={e => setNewItemUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                  BCS / Competitive Exam Relevance Notes
                </label>
                <input
                  type="text"
                  placeholder="Key angle for Written or Preliminary exams..."
                  value={newItemNotes}
                  onChange={e => setNewItemNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="flagImportant"
                  checked={newItemIsImportant}
                  onChange={e => setNewItemIsImportant(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="flagImportant" className="text-stone-700 dark:text-stone-300 font-medium">
                  Highlight as High-Yield for Exam Prep
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 shadow-xs"
                >
                  Publish to Daily Digest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
