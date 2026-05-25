import { useTimer } from '../context/TimerContext';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

const TimerCard = ({ timer }) => {
  const { toggleTimer, resetTimer } = useTimer();

  const timeLeft = timer.remainingSeconds;
  const isRunning = timer.status === 'ACTIVE';
  const totalDuration = timer.durationSeconds;
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  // Circular ring dimensions
  const ringSize = 180;
  const radius = (ringSize - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const handlePlayPause = () => {
    if (timeLeft <= 0) return;
    toggleTimer(timer.id);
  };

  const handleReset = () => {
    resetTimer(timer.id);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isDone = timer.status === 'DONE' || timeLeft <= 0;
  const statusClass = isDone ? 'done' : isRunning ? 'active' : 'paused';

  return (
    <div className="glass glass-card timer-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{timer.title}</h3>
          {timer.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{timer.description}</p>
          )}
        </div>
        <span className={`timer-status-badge ${statusClass}`}>
          {isDone ? 'Done' : isRunning ? 'Running' : 'Paused'}
        </span>
      </div>

      <div className="timer-ring-container">
        <svg width={ringSize} height={ringSize} className="timer-ring">
          <circle className="timer-ring-bg" cx={ringSize / 2} cy={ringSize / 2} r={radius} />
          <circle
            className={`timer-ring-progress ${isDone ? 'completed' : ''}`}
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={isDone ? circumference : offset}
          />
        </svg>
        <div style={{ position: 'absolute' }}>
          <div className={`timer-display ${isRunning ? 'running' : ''} ${isDone ? 'completed' : ''}`} style={{ fontSize: '32px' }}>
            {isDone ? (
              <CheckCircle size={40} style={{ color: 'var(--success-color)' }} />
            ) : (
              formatTime(timeLeft)
            )}
          </div>
        </div>
      </div>

      {!isDone && (
        <div className="timer-controls">
          <button className="timer-control-btn" onClick={handleReset} title="Reset">
            <RotateCcw size={18} />
          </button>
          <button className={`timer-control-btn play`} onClick={handlePlayPause} title={isRunning ? 'Pause' : 'Start'}>
            {isRunning ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerCard;
