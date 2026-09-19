import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  X,
  Award,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exam, Question, ExamAttempt, ExamAnswer, User } from '../../types';
import { storageService } from '../../services/storage';

interface ExamTakingModalProps {
  exam: Exam;
  questions: Question[];
  currentUser: User;
  onClose: () => void;
  onAttemptCompleted: (attempt: ExamAttempt) => void;
}

export const ExamTakingModal: React.FC<ExamTakingModalProps> = ({
  exam,
  questions,
  currentUser,
  onClose,
  onAttemptCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(exam.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<ExamAttempt | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (qId: string, optIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optIndex,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    const timeTakenMinutes = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 60000)
    );

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const answers: ExamAnswer[] = questions.map(q => {
      const selected = selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1;
      const isCorrect = selected === q.answerIndex;
      if (selected === -1) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
        timeSpentSeconds: 30,
      };
    });

    // Score calculation with standard -0.25 negative marking for incorrect
    const rawScore = correctCount * (exam.totalMarks / questions.length) - incorrectCount * 0.25;
    const finalScore = Math.max(0, Math.round(rawScore * 10) / 10);
    const percentage = Math.round((correctCount / questions.length) * 100);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const monthKey = dateStr.slice(0, 7);

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      examType: exam.type,
      userId: currentUser.id,
      userName: currentUser.name,
      score: finalScore,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      skippedCount,
      percentage,
      timeTakenMinutes,
      submittedAt: now.toISOString(),
      monthKey,
      answers,
    };

    storageService.addExamAttempt(attempt);
    storageService.addAuditLog(
      currentUser.email,
      'EXAM_COMPLETED',
      `Completed ${exam.title} with score ${finalScore}/${exam.totalMarks} (${percentage}%)`,
      'success'
    );

    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    setAttemptResult(attempt);
    setIsFinished(true);
    setIsSubmitting(false);
    onAttemptCompleted(attempt);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // If exam is completed, show comprehensive result review
  if (isFinished && attemptResult) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Official Result & Diagnostics
              </span>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {exam.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Performance Summary Banner */}
          <div className="my-6 p-6 rounded-2xl bg-amber-50/50 dark:bg-stone-950/60 border border-amber-200/60 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-xs text-stone-500">Total Score</span>
              <div className="text-2xl font-mono font-bold text-stone-900 dark:text-stone-100 mt-1">
                {attemptResult.score}/{exam.totalMarks}
              </div>
            </div>
            <div>
              <span className="text-xs text-stone-500">Accuracy</span>
              <div className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
                {attemptResult.percentage}%
              </div>
            </div>
            <div>
              <span className="text-xs text-stone-500">Correct / Wrong</span>
              <div className="text-2xl font-mono font-bold text-stone-900 dark:text-stone-100 mt-1">
                <span className="text-emerald-600">{attemptResult.correctCount}</span> /{' '}
                <span className="text-rose-600">{attemptResult.incorrectCount}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-stone-500">Time Taken</span>
              <div className="text-2xl font-mono font-bold text-stone-900 dark:text-stone-100 mt-1">
                {attemptResult.timeTakenMinutes}m
              </div>
            </div>
          </div>

          {/* Question-by-Question Review with Explanations */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              Detailed Question Review & Explanations
            </h3>
            {questions.map((q, idx) => {
              const ans = attemptResult.answers.find(a => a.questionId === q.id);
              const userChoice = ans?.selectedOption ?? -1;
              const isCorrect = ans?.isCorrect;
              const options = [q.optionA, q.optionB, q.optionC, q.optionD];

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/40'
                      : userChoice === -1
                      ? 'bg-stone-50 dark:bg-stone-950/30 border-stone-200 dark:border-stone-800'
                      : 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-mono text-xs font-bold text-stone-400">
                      Q{idx + 1}.
                    </span>
                    <p className="flex-1 font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {q.text}
                    </p>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : userChoice === -1
                          ? 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'Correct (+1.0)' : userChoice === -1 ? 'Skipped (0.0)' : 'Incorrect (-0.25)'}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    {options.map((opt, optIdx) => {
                      const isKey = optIdx === q.answerIndex;
                      const wasSelected = optIdx === userChoice;

                      let optClass = 'bg-white dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300';
                      if (isKey) {
                        optClass = 'bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-semibold';
                      } else if (wasSelected && !isCorrect) {
                        optClass = 'bg-rose-100/70 dark:bg-rose-900/40 border-rose-400 text-rose-950 dark:text-rose-200 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${optClass}`}
                        >
                          <span>
                            <span className="font-mono font-bold mr-2">
                              {['A', 'B', 'C', 'D'][optIdx]}.
                            </span>
                            {opt}
                          </span>
                          {isKey && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Callout */}
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-xs text-stone-700 dark:text-stone-300">
                    <span className="font-semibold text-amber-800 dark:text-amber-400">
                      Official Review:
                    </span>{' '}
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 shadow-xs"
            >
              Return to Exam Hall
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Exam Taking Screen
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header with Live Countdown Timer */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Exam in Progress • Negative Marking -0.25
            </span>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {exam.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                timeLeftSeconds < 180
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatCountdown(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you wish to submit early?')) {
                  handleSubmitExam();
                }
              }}
              className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 shadow-xs"
            >
              Finish & Submit
            </button>
          </div>
        </div>

        {/* Question Area & Navigator Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* Main Question view (8 cols) */}
          <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800">
            {currentQuestion ? (
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <button
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      flaggedQuestions[currentQuestion.id]
                        ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-800 dark:text-amber-300'
                        : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>
                      {flaggedQuestions[currentQuestion.id] ? 'Flagged for Review' : 'Flag'}
                    </span>
                  </button>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-relaxed mb-6">
                  {currentQuestion.text}
                </h3>

                {/* Options list */}
                <div className="space-y-3">
                  {[
                    currentQuestion.optionA,
                    currentQuestion.optionB,
                    currentQuestion.optionC,
                    currentQuestion.optionD,
                  ].map((optText, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between text-sm ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 font-semibold shadow-xs ring-1 ring-amber-500'
                            : 'bg-stone-50/50 dark:bg-stone-950/30 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isSelected
                                ? 'bg-amber-600 text-white'
                                : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                            }`}
                          >
                            {['A', 'B', 'C', 'D'][optIdx]}
                          </span>
                          <span>{optText}</span>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p>No question found.</p>
            )}

            {/* Bottom Question Nav Controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium disabled:opacity-30"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    handleSubmitExam();
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold shadow-xs"
              >
                <span>{currentIndex < questions.length - 1 ? 'Save & Next' : 'Submit Exam'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Matrix Sidebar (4 cols) */}
          <div className="md:col-span-4 p-6 bg-stone-50/50 dark:bg-stone-950/40 space-y-5">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                Question Matrix ({Object.keys(selectedAnswers).length}/{questions.length} Answered)
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions[q.id];
                  const isCurrent = idx === currentIndex;

                  let itemClass = 'bg-stone-100 dark:bg-stone-800 text-stone-600';
                  if (isAnswered) itemClass = 'bg-emerald-600 text-white font-bold';
                  if (isFlagged) itemClass = 'bg-amber-500 text-white font-bold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all ${itemClass} ${
                        isCurrent ? 'ring-2 ring-amber-500 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-4 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span>Flagged for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-stone-200 dark:bg-stone-800" />
                <span>Unattempted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
