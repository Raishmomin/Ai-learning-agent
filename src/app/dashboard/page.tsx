// ============================================
// Dashboard Page — Career OS Command Center
// Displays 11 daily modules, IELTS daily banner, timers, and brutal performance stats
// ============================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Flame, Target, Clock, BookOpen, Code, MessageSquare,
  ChevronRight, RefreshCw, Sparkles, Loader2, Award, Zap, Terminal, ShieldAlert
} from 'lucide-react';
import type { DailySummary, TaskSummaryItem } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  DSA: '#e17055',
  SYSTEM_DESIGN: '#6c5ce7',
  JAVASCRIPT: '#fdcb6e',
  TYPESCRIPT: '#3178c6',
  REACT_NEXTJS: '#74b9ff',
  NODEJS: '#68a063',
  DATABASE: '#00cec9',
  SECURITY: '#d63031',
  DEVOPS: '#00b894',
  CLOUD_AWS: '#ff9900',
  KUBERNETES: '#326ce5',
  AI_ML: '#a29bfe',
  ENGLISH: '#55efc4',
  VOCABULARY: '#e84393',
  BEHAVIOURAL: '#fab1a0',
  CASE_STUDY: '#fd79a8',
  MONITORING: '#e056fd',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  ENGINEERING_CHALLENGE: <Code size={16} />,
  CODING_CHALLENGE: <Code size={16} />,
  DEEP_TECHNICAL: <Zap size={16} />,
  CASE_STUDY: <Award size={16} />,
  PRODUCTION_INCIDENT: <ShieldAlert size={16} />,
  CODE_REVIEW: <Terminal size={16} />,
  SYSTEM_DESIGN_QA: <MessageSquare size={16} />,
  AI_ENGINEERING: <Sparkles size={16} />,
  DEVOPS_LAB: <Terminal size={16} />,
  VOCABULARY: <BookOpen size={16} />,
  GRAMMAR: <BookOpen size={16} />,
  IELTS_READING: <BookOpen size={16} />,
  IELTS_LISTENING: <BookOpen size={16} />,
  IELTS_SPEAKING: <MessageSquare size={16} />,
  IELTS_WRITING: <BookOpen size={16} />,
  ENGLISH_SPEAKING: <MessageSquare size={16} />,
  REVIEW: <RefreshCw size={16} />,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [planExists, setPlanExists] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/learning/daily-brief');
      const data = await res.json();
      setSummary(data);
      if (data.tasksToday?.length === 0 && data.greeting?.includes('Create')) {
        setPlanExists(false);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const initPlan = async () => {
    setGenerating(true);
    try {
      await fetch('/api/learning/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: 'Raish' })
      });
      setPlanExists(true);
      await generateTasks();
    } catch (err) {
      console.error('Failed to init plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const generateTasks = async () => {
    setGenerating(true);
    try {
      await fetch('/api/learning/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      });
      await fetchSummary();
    } catch (err) {
      console.error('Failed to generate tasks:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 100, width: '100%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (!planExists) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse-glow">
          <Sparkles size={36} color="white" />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">Initialize 6-Month Career OS</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 460, textAlign: 'center', lineHeight: 1.6 }}>
          Targeting Senior Engineer relocation to Netherlands, Estonia, Germany, and Ireland. Generates 11 high-stakes daily modules with timers and IELTS 8.5+ prep.
        </p>
        <button onClick={initPlan} className="btn-accent" disabled={generating} style={{ padding: '14px 40px', fontSize: 16 }}>
          {generating ? <><Loader2 size={18} className="animate-spin" /> Launching Career OS...</> : '🚀 Launch Career OS Plan'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header & IELTS Banner */}
      <div className="animate-fade-in-up">
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{summary?.greeting}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontStyle: 'italic', marginBottom: 12 }}>
          &ldquo;{summary?.motivationalQuote}&rdquo;
        </p>

        {summary?.ieltsFocusToday && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px',
            borderRadius: 12,
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontSize: 13,
            fontWeight: 700,
            color: '#38bdf8'
          }}>
            🇬🇧 {summary.ieltsFocusToday}
          </div>
        )}
      </div>

      {/* Performance Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }} className="animate-fade-in-up">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={20} color="var(--danger)" />
            <span className="stat-label">Streak</span>
          </div>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>{summary?.streak || 0}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>days</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={20} color="var(--accent-primary)" />
            <span className="stat-label">Daily Modules</span>
          </div>
          <span className="stat-value" style={{ color: 'var(--accent-secondary)' }}>
            {summary?.tasksToday?.length || 0}/11
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>modules</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={20} color="var(--warning)" />
            <span className="stat-label">Reviews Due</span>
          </div>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{summary?.reviewsDue || 0}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>cards</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="var(--success)" />
            <span className="stat-label">Weekly Mastery</span>
          </div>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{summary?.weeklyProgress || 0}%</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>completed</span>
        </div>
      </div>

      {/* Generate / Refresh Button */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={generateTasks} className="btn-accent" disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {generating ? 'Generating 11 Daily Modules...' : 'Generate Today\'s 11 Modules'}
        </button>
      </div>

      {/* Task List */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          📋 Today&apos;s High-Stakes Career OS Modules ({summary?.tasksToday?.length || 0})
        </h3>

        {(!summary?.tasksToday || summary.tasksToday.length === 0) ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>No modules generated for today yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Click &ldquo;Generate Today&apos;s 11 Modules&rdquo; to launch your senior daily routine.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {summary.tasksToday.map((task: TaskSummaryItem, index: number) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, index }: { task: TaskSummaryItem; index: number }) {
  const color = CATEGORY_COLORS[task.category] || 'var(--accent-primary)';
  const icon = TYPE_ICONS[task.type] || <BookOpen size={16} />;
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div
      className="task-card animate-fade-in-up"
      style={{
        animationDelay: `${index * 50}ms`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <div style={{ width: 4, height: 48, borderRadius: 2, background: color, flexShrink: 0 }} />

      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {task.isReview ? <RefreshCw size={16} /> : icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.title}
          </h4>
          {isCompleted && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
              ✓ Score: {task.score}%
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge badge-${task.difficulty.toLowerCase()}`}>{task.difficulty}</span>
          <span className="badge badge-review">{task.type.replace(/_/g, ' ')}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {task.estimatedMinutes} min
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <a
          href={`/dashboard/practice?taskId=${task.id}`}
          className={isCompleted ? 'btn-secondary' : 'btn-accent'}
          style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
        >
          {isCompleted ? 'Review' : 'Start'} <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}

function TrendingUp({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
