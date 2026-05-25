import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const TimerContext = createContext();

const STORAGE_KEY = 'timerTasks';

const loadTimers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveTimers = (timers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const TimerProvider = ({ children }) => {
  const toast = useToast();
  const [timers, setTimers] = useState(loadTimers);

  // Sync to localStorage
  useEffect(() => {
    saveTimers(timers);
  }, [timers]);

  // Document title updater for active timers
  useEffect(() => {
    const activeTimer = timers.find((t) => t.status === 'ACTIVE');
    if (activeTimer) {
      document.title = `[${formatTime(activeTimer.remainingSeconds)}] ${activeTimer.title}`;
    } else {
      document.title = 'TaskManager';
    }
  }, [timers]);

  const playCompletionSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gain.gain.value = 0.1;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio not supported — silent fallback
    }
  };

  const triggerNotification = (title) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(`⏱ "${title}" is complete!`, {
        body: 'Your timer has finished. Great work!',
        icon: '⏱',
      });
    }
  };

  // Central ticker: runs every second and updates any ACTIVE timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const active = prev.filter((t) => t.status === 'ACTIVE');
        if (active.length === 0) return prev;

        return prev.map((t) => {
          if (t.status === 'ACTIVE') {
            const remaining = Math.max(0, t.remainingSeconds - 1);
            if (remaining === 0) {
              playCompletionSound();
              triggerNotification(t.title);
              setTimeout(() => {
                toast.success(`Timer "${t.title}" completed! 🎉`);
              }, 0);
              return {
                ...t,
                remainingSeconds: 0,
                status: 'DONE',
              };
            }
            return {
              ...t,
              remainingSeconds: remaining,
            };
          }
          return t;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  const createTimer = (title, description, minutes) => {
    const timer = {
      id: Date.now(),
      title,
      description,
      durationSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      status: 'IDLE',
      createdAt: new Date().toISOString(),
    };
    setTimers((prev) => [timer, ...prev]);
    toast.success(`Timer "${title}" created`);
    return timer;
  };

  const startPomodoro = () => {
    createTimer('Focus Session', 'Pomodoro-style 25-minute focus block', 25);
  };

  const toggleTimer = (id) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCurrentlyActive = t.status === 'ACTIVE';
          const nextStatus = isCurrentlyActive ? 'PAUSED' : 'ACTIVE';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const resetTimer = (id) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, status: 'IDLE', remainingSeconds: t.durationSeconds };
        }
        return t;
      })
    );
  };

  const deleteTimer = (id) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
    toast.info('Timer removed');
  };

  const clearHistory = () => {
    setTimers((prev) => prev.filter((t) => t.status !== 'DONE'));
    toast.info('History cleared');
  };

  return (
    <TimerContext.Provider
      value={{
        timers,
        createTimer,
        startPomodoro,
        toggleTimer,
        resetTimer,
        deleteTimer,
        clearHistory,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within a TimerProvider');
  return ctx;
};
