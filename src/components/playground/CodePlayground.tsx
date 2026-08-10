// ============================================
// CodePlayground Component — In-browser Monaco JS/TS Playground
// Supports code editing, formatting (Ctrl+Shift+F), execution, test-case verification, and logs
// ============================================

'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, XCircle, Terminal, Eye, Code2, Loader2, Sparkles } from 'lucide-react';
import { runSandboxCode, ExecutionResult } from '@/lib/sandbox/runner';
import type { TestCase } from '@/types';

interface CodePlaygroundProps {
  initialCode?: string;
  testCases?: TestCase[];
  solutionCode?: string;
  onCodeChange?: (code: string) => void;
}

export function CodePlayground({
  initialCode = '// Write your JavaScript solution here\nfunction solution(input) {\n  return input;\n}',
  testCases = [],
  solutionCode,
  onCodeChange,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await runSandboxCode(code, testCases);
      setResult(res);
    } catch (err: any) {
      setResult({
        logs: [],
        output: '',
        error: err?.message || 'Failed to execute code',
        durationMs: 0,
        testResults: [],
        allPassed: false,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleEditorChange = (val: string | undefined) => {
    const newCode = val || '';
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      borderRadius: 16,
      background: 'rgba(15, 23, 42, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    }}>
      {/* Playground Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code2 size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            JavaScript / TypeScript Code Playground
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {solutionCode && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Eye size={14} /> {showSolution ? 'Hide Solution' : 'View Model Solution'}
            </button>
          )}

          <button
            onClick={handleRun}
            disabled={running}
            className="btn-accent"
            style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? 'Running...' : '▶ Run Code'}
          </button>
        </div>
      </div>

      {/* Editor & Solution Pane */}
      <div style={{ display: 'grid', gridTemplateColumns: showSolution ? '1fr 1fr' : '1fr', gap: 1 }}>
        <div style={{ height: 350, borderRight: showSolution ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
          <Editor
            height="350px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              formatOnType: true,
              formatOnPaste: true,
            }}
          />
        </div>

        {showSolution && (
          <div style={{ height: 350, background: 'rgba(10, 15, 30, 0.9)' }}>
            <div style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', fontSize: 12, fontWeight: 600, color: 'var(--accent-secondary)' }}>
              💡 Model Solution Reference
            </div>
            <Editor
              height="310px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={solutionCode || '// No solution specified'}
              options={{
                readOnly: true,
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        )}
      </div>

      {/* Execution Results & Console Logs */}
      {result && (
        <div style={{
          padding: 20,
          background: 'rgba(10, 15, 26, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                Execution Results ({result.durationMs}ms)
              </span>
            </div>

            {testCases.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {result.allPassed ? (
                  <span className="badge badge-easy" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={14} /> All Test Cases Passed
                  </span>
                ) : (
                  <span className="badge badge-hard" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <XCircle size={14} /> Test Cases Failed
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Test Case Breakdown */}
          {result.testResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Test Verification:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {result.testResults.map((tc, idx) => (
                  <div key={idx} style={{
                    padding: 12,
                    borderRadius: 10,
                    background: tc.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${tc.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    fontSize: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: tc.passed ? '#10b981' : '#ef4444' }}>
                        Test #{tc.testIndex + 1} {tc.passed ? '✓ PASSED' : '✕ FAILED'}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Input: {tc.input}</div>
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Expected: {tc.expected}</div>
                    <div style={{ color: tc.passed ? '#10b981' : '#ef4444', fontFamily: 'monospace', fontWeight: 600 }}>
                      Actual: {tc.actual}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Console Logs */}
          {result.logs.length > 0 && (
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Console Logs:</span>
              <pre style={{
                marginTop: 6,
                padding: 12,
                borderRadius: 8,
                background: '#050811',
                color: '#a7f3d0',
                fontSize: 12,
                fontFamily: 'monospace',
                maxHeight: 120,
                overflowY: 'auto',
              }}>
                {result.logs.join('\n')}
              </pre>
            </div>
          )}

          {/* Error Message */}
          {result.error && (
            <div style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: 13,
              fontFamily: 'monospace',
            }}>
              🚨 {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
