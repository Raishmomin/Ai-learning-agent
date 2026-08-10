'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Flame, Target, Calendar, BookOpen } from 'lucide-react';

interface ProgressData {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  avgScore: number | null;
  streak: number;
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCompleted: 0, bestStreak: 0, avgScore: 0, totalDays: 0 });

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/learning/progress');
      const data = await res.json();
      if (data.progress) {
        setProgress(data.progress);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 60 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800 }}>
        <span className="gradient-text">Progress Analytics</span>
      </h2>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard icon={<Target size={20} />} label="Tasks Completed" value={stats.totalCompleted} color="var(--accent-primary)" />
        <StatCard icon={<Flame size={20} />} label="Best Streak" value={`${stats.bestStreak} days`} color="var(--danger)" />
        <StatCard icon={<TrendingUp size={20} />} label="Avg Score" value={`${stats.avgScore}%`} color="var(--success)" />
        <StatCard icon={<Calendar size={20} />} label="Active Days" value={stats.totalDays} color="var(--info)" />
      </div>

      {/* Activity Heatmap */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📊 14-Day Activity</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {progress.map((day) => {
            const intensity = day.tasksTotal > 0 ? day.tasksCompleted / day.tasksTotal : 0;
            const bg = intensity === 0 ? 'var(--bg-primary)' :
              intensity < 0.33 ? 'rgba(108, 92, 231, 0.2)' :
              intensity < 0.66 ? 'rgba(108, 92, 231, 0.4)' :
              intensity < 1 ? 'rgba(108, 92, 231, 0.7)' : 'var(--accent-primary)';

            return (
              <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, border: '1px solid var(--border)',
                  color: intensity > 0.5 ? 'white' : 'var(--text-secondary)',
                }} title={`${day.date}: ${day.tasksCompleted}/${day.tasksTotal} tasks`}>
                  {day.tasksCompleted}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Trend */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📈 Score Trend</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
          {progress.filter(p => p.avgScore).map((day) => {
            const height = ((day.avgScore || 0) / 100) * 180;
            const color = (day.avgScore || 0) >= 80 ? 'var(--success)' : (day.avgScore || 0) >= 50 ? 'var(--warning)' : 'var(--danger)';
            return (
              <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{day.avgScore}%</span>
                <div style={{ width: '100%', maxWidth: 32, height, background: color, borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'all 0.3s ease' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                  {new Date(day.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="stat-card animate-fade-in-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>{icon}<span className="stat-label">{label}</span></div>
      <span className="stat-value" style={{ color }}>{value}</span>
    </div>
  );
}

