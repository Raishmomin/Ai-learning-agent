// ============================================
// Practice Page — Interactive Learning & Task Evaluation
// Integrated with TaskTimer and TaskRenderer for structured content
// ============================================

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BookOpen, ChevronLeft, ChevronRight,
  Loader2, Send
} from 'lucide-react';
import { TaskTimer } from '@/components/dashboard/TaskTimer';
import { TaskRenderer } from '@/components/learning/TaskRenderer';

interface TaskData {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  content: Record<string, unknown>;
  solution: Record<string, unknown>;
  status: string;
  allocatedSec?: number;
  topic?: { category: string; title: string };
}

interface EvalResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string;
  ieltsBand?: number;
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 60 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskIdParam = searchParams.get('taskId');

  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [spentTime, setSpentTime] = useState(0);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/learning/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
      if (taskIdParam && data.tasks) {
        const idx = data.tasks.findIndex((t: TaskData) => t.id === taskIdParam);
        if (idx >= 0) setCurrentIndex(idx);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [taskIdParam]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const currentTask = tasks[currentIndex];

  const submitAnswer = async () => {
    if (!currentTask || !userAnswer.trim()) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/learning/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: currentTask.id, answer: userAnswer, timeSpentSec: spentTime }),
      });
      const data = await res.json();
      setEvalResult(data);
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const nextTask = () => {
    const nextIdx = Math.min(currentIndex + 1, tasks.length - 1);
    setCurrentIndex(nextIdx);
    setUserAnswer('');
    setEvalResult(null);
    setSpentTime(0);
    router.push(`/dashboard/practice?taskId=${tasks[nextIdx]?.id}`);
  };

  const prevTask = () => {
    const prevIdx = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIdx);
    setUserAnswer('');
    setEvalResult(null);
    setSpentTime(0);
    router.push(`/dashboard/practice?taskId=${tasks[prevIdx]?.id}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 60 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <BookOpen size={48} color="var(--text-muted)" />
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>No tasks available</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Generate today&apos;s tasks from the dashboard first.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            Task {currentIndex + 1} of {tasks.length} — {currentTask.title}
          </h2>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Category: {currentTask.topic?.category || currentTask.type}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <TaskTimer
            allocatedSec={currentTask.allocatedSec || 1800}
            onTimerChange={(s) => setSpentTime(s)}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={prevTask} className="btn-secondary" disabled={currentIndex === 0} style={{ padding: '8px 12px' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextTask} className="btn-secondary" disabled={currentIndex === tasks.length - 1} style={{ padding: '8px 12px' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Task View Card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span className={`badge badge-${currentTask.difficulty.toLowerCase()}`}>{currentTask.difficulty}</span>
          <span className="badge badge-review">{currentTask.type.replace(/_/g, ' ')}</span>
        </div>

        {/* Universal Task Content Renderer */}
        <TaskRenderer
          task={currentTask}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
        />
      </div>

      {/* Evaluation Submit Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={submitAnswer}
          className="btn-accent"
          disabled={evaluating || !userAnswer.trim()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: 1, padding: '14px 24px', fontSize: 16 }}
        >
          {evaluating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {evaluating ? 'Evaluating against Senior Tech Standard...' : 'Submit Work for Evaluation'}
        </button>
      </div>

      {/* Evaluation Results Card */}
      {evalResult && <EvaluationResultCard result={evalResult} />}
    </div>
  );
}

function EvaluationResultCard({ result }: { result: EvalResult }) {
  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: 28, borderColor: result.score >= 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
          🎯 Senior Hiring Principal Evaluation
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {result.ieltsBand && (
            <span style={{ fontSize: 16, fontWeight: 800, color: '#38bdf8', padding: '6px 14px', borderRadius: 8, background: 'rgba(56, 189, 248, 0.1)' }}>
              IELTS Band: {result.ieltsBand}
            </span>
          )}
          <span style={{
            fontSize: 24,
            fontWeight: 900,
            color: result.score >= 70 ? '#10b981' : '#ef4444',
          }}>
            {result.score}/100
          </span>
        </div>
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 20, whiteSpace: 'pre-wrap' }}>
        {result.feedback}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {result.strengths?.length > 0 && (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>💪 Key Strengths:</h4>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {result.improvements?.length > 0 && (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>🎯 Required Improvements:</h4>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              {result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
            </ul>
          </div>
        )}
      </div>

      {result.nextSteps && (
        <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: 13, color: '#7dd3fc' }}>
          💡 <strong>Actionable Next Step:</strong> {result.nextSteps}
        </div>
      )}
    </div>
  );
}
