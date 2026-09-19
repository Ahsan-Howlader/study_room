import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Coffee, BookOpen } from 'lucide-react';

interface FocusTimerProps {
  onSessionComplete?: (durationMinutes: number) => void;
  chapterTitle?: string;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete, chapterTitle }) => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modeDurations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime();
            if (mode === 'focus' && onSessionComplete) {
              onSessionComplete(25);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, onSessionComplete]);

  const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modeDurations[newMode]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeDurations[mode]);
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext fallback
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = 100 - (timeLeft / modeDurations[mode]) * 100;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-lg hover:scale-105 transition-all text-xs font-medium"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-stone-400'}`} />
        <span>{formatTime(timeLeft)}</span>
        <span className="text-[10px] opacity-75 capitalize">({mode})</span>
      </button>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-sm backdrop-blur-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
            Study Focus Timer
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 px-1"
            title="Minimize"
          >
            —
          </button>
        </div>
      </div>

      {chapterTitle && (
        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mb-3">
          Focusing on: <span className="font-medium text-stone-700 dark:text-stone-300">{chapterTitle}</span>
        </p>
      )}

      {/* Mode selectors */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-4 text-xs font-medium">
        <button
          onClick={() => switchMode('focus')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            mode === 'focus'
              ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>Focus</span>
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            mode === 'shortBreak'
              ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Coffee className="w-3 h-3" />
          <span>Break</span>
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            mode === 'longBreak'
              ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <span>15m Rest</span>
        </button>
      </div>

      {/* Digital readout & circular progress */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-4xl font-mono font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {formatTime(timeLeft)}
        </div>
        {/* Progress bar */}
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-amber-600 dark:bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-transform active:scale-95"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
        <button
          onClick={resetTimer}
          className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
