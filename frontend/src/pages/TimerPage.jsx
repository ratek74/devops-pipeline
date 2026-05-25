import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useTimer } from '../context/TimerContext';
import TimerCard from '../components/TimerCard';
import { Plus, Timer, Bell, BellOff, Zap, Clock, Trash2 } from 'lucide-react';

const TimerPage = () => {
  const toast = useToast();
  const {
    timers,
    createTimer,
    startPomodoro,
    deleteTimer,
    clearHistory
  } = useTimer();

  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // New timer form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMinutes, setNewMinutes] = useState(25);

  const requestNotifPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      toast.success('Notifications enabled!');
    } else {
      toast.warning('Notifications denied. Timers will still work.');
    }
  };

  const handleCreateTimer = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTimer(newTitle.trim(), newDesc.trim(), newMinutes);
    setNewTitle('');
    setNewDesc('');
    setNewMinutes(25);
    setShowForm(false);
  };

  const activeTimers = timers.filter((t) => t.status !== 'DONE');
  const completedTimers = timers.filter((t) => t.status === 'DONE');

  return (
    <div className="timer-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Timer size={28} style={{ color: 'var(--primary-color)' }} />
        <h1 style={{ fontSize: '28px' }}>Timer Tasks</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Time-boxed work sessions with countdown timers and browser notifications.
      </p>

      {/* Notification Permission Banner */}
      {notifPermission === 'default' && (
        <div className="notification-banner prompt">
          <Bell size={20} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Enable browser notifications to get alerted when timers complete.</span>
          <button onClick={requestNotifPermission} className="btn btn-sm">
            Enable Notifications
          </button>
        </div>
      )}

      {notifPermission === 'denied' && (
        <div className="notification-banner denied">
          <BellOff size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>Notifications are blocked. Timers will still run but won't send push notifications. Enable in browser settings.</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button className="pomodoro-btn" onClick={startPomodoro}>
          <Zap size={18} /> Start Focus Session (25 min)
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Custom Timer'}
        </button>
      </div>

      {/* New Timer Form */}
      {showForm && (
        <div className="glass glass-card" style={{ marginBottom: '24px', maxWidth: '500px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Create Timer</h3>
          <form onSubmit={handleCreateTimer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                placeholder="What are you working on?"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Duration (minutes)</label>
              <input
                type="number"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={480}
                style={{ maxWidth: '150px' }}
              />
            </div>
            <button type="submit" className="btn btn-sm" style={{ alignSelf: 'flex-start' }}>
              <Plus size={16} /> Create Timer
            </button>
          </form>
        </div>
      )}

      {/* Active Timers */}
      {activeTimers.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> Active Timers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {activeTimers.map((timer) => (
              <div key={timer.id} style={{ position: 'relative' }}>
                <TimerCard timer={timer} />
                <button
                  onClick={() => deleteTimer(timer.id)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', zIndex: 2 }}
                  title="Remove timer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeTimers.length === 0 && completedTimers.length === 0 && (
        <div className="glass glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Timer size={48} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '12px' }} />
          <h3 style={{ marginBottom: '8px' }}>No timers yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            Start a focus session or create a custom timer to track your work.
          </p>
        </div>
      )}

      {/* Completed History */}
      {completedTimers.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Completed ({completedTimers.length})
            </h2>
            <button onClick={clearHistory} className="btn btn-secondary btn-sm">
              Clear History
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completedTimers.map((timer) => (
              <div
                key={timer.id}
                className="glass"
                style={{ padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="timer-status-badge done">Done</span>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>{timer.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {Math.floor(timer.durationSeconds / 60)} min
                  </span>
                  <button
                    onClick={() => deleteTimer(timer.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerPage;
