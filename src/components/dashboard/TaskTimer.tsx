// ============================================
// TaskTimer Component — Tracks task duration with overtime (Red timer)
// Does NOT stop the task on timer expiry; tracks extra time continuously.
// ============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, AlertCircle, Clock } from 'lucide-react';

interface TaskTimerProps {
  allocatedSec: number; // Allocated seconds (e.g. 2700 for 45 mins)
  onTimerChange?: (spentSec: number, overtimeSec: number) => void;
  autoStart?: boolean;
}

export function TaskTimer({ allocatedSec, onTimerChange, autoStart = true }: TaskTimerProps) {
  const [spentSec, setSpentSec] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const onTimerChangeRef = useRef(onTimerChange);
  onTimerChangeRef.current = onTimerChange;

  // Tick interval — only increments state, no parent callbacks during render
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSpentSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Notify parent AFTER render completes (fixes setState-in-render error)
  useEffect(() => {
    const overtime = Math.max(0, spentSec - allocatedSec);
    onTimerChangeRef.current?.(spentSec, overtime);
  }, [spentSec, allocatedSec]);

  const isOvertime = spentSec > allocatedSec;
  const remainingSec = Math.max(0, allocatedSec - spentSec);
  const overtimeSec = Math.max(0, spentSec - allocatedSec);

  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      borderRadius: 12,
      background: isOvertime ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
      border: `1px solid ${isOvertime ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isOvertime ? (
          <AlertCircle size={16} color="#ef4444" className="animate-pulse" />
        ) : (
          <Clock size={16} color="#10b981" />
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color: isOvertime ? '#ef4444' : '#10b981' }}>
          {isOvertime ? 'Overtime:' : 'Remaining:'}
        </span>
      </div>

      <span style={{
        fontSize: 18,
        fontWeight: 800,
        fontFamily: 'monospace',
        color: isOvertime ? '#ef4444' : '#10b981',
        letterSpacing: 1
      }}>
        {isOvertime ? `+${formatTime(overtimeSec)}` : formatTime(remainingSec)}
      </span>

      <button
        onClick={() => setIsRunning(!isRunning)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-secondary)',
          padding: 4,
        }}
        title={isRunning ? 'Pause Timer' : 'Resume Timer'}
      >
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
}
