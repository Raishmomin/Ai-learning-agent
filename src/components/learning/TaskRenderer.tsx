// ============================================
// TaskRenderer Component — Universal Structured Content Renderer
// Guarantees clean, rich UI rendering for all 11 task types with zero raw JSON output.
// ============================================

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Zap, Award, ShieldAlert, Terminal, HelpCircle, BookOpen, ChevronRight } from 'lucide-react';
import { CodePlayground } from '@/components/playground/CodePlayground';
import { SpeechRecorder } from '@/components/learning/SpeechRecorder';
import type { TestCase } from '@/types';

interface TaskRendererProps {
  task: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
    content: Record<string, unknown>;
    solution?: Record<string, unknown>;
  };
  userAnswer: string;
  setUserAnswer: (val: string) => void;
}

export function TaskRenderer({ task, userAnswer, setUserAnswer }: TaskRendererProps) {
  const parsedContent = parseTaskContent(task.content);
  const parsedSolution = parseTaskContent(task.solution || {});

  switch (task.type) {
    case 'DEEP_TECHNICAL':
      return <DeepTechnicalRenderer content={parsedContent} solution={parsedSolution} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'CASE_STUDY':
      return <CaseStudyRenderer content={parsedContent} solution={parsedSolution} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'PRODUCTION_INCIDENT':
      return <ProductionIncidentRenderer content={parsedContent} solution={parsedSolution} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'CODE_REVIEW':
      return <CodeReviewRenderer content={parsedContent} solution={parsedSolution} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'ENGINEERING_CHALLENGE':
    case 'CODING_CHALLENGE':
    case 'AI_ENGINEERING':
      return <CodingTaskRenderer taskTitle={task.title} content={parsedContent} solution={parsedSolution} setUserAnswer={setUserAnswer} />;

    case 'IELTS_SPEAKING':
    case 'ENGLISH_SPEAKING':
      return <IELTSSpeakingRenderer content={parsedContent} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'IELTS_WRITING':
      return <IELTSWritingRenderer content={parsedContent} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'IELTS_READING':
      return <IELTSReadingRenderer content={parsedContent} solution={parsedSolution} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'VOCABULARY':
      return <VocabularyRenderer content={parsedContent} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    case 'GRAMMAR':
      return <GrammarRenderer content={parsedContent} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;

    default:
      return <DefaultStructuredRenderer content={parsedContent} solution={parsedSolution} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />;
  }
}

/**
 * Strip ```json codeblocks and whitespace
 */
function cleanJSONString(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
}

/**
 * Robust JSON parse with fallback regex extractor
 */
function safeParseJSON(str: string): any {
  if (typeof str !== 'string') return null;
  const cleaned = cleanJSONString(str);
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const sanitized = cleaned.replace(/[\r\n]+/g, '\\n');
      return JSON.parse(sanitized);
    } catch {
      return null;
    }
  }
}

/**
 * Extract clean overview & body text from raw string (handling truncated/malformed JSON strings safely)
 */
function extractCleanText(raw: any): { overview?: string; body?: string } {
  if (!raw) return {};

  if (typeof raw === 'object') {
    const ov = raw.overview || raw.description;
    const bd = raw.contentMarkdown || raw.markdown || raw.content || raw.text;
    return { overview: typeof ov === 'string' ? ov : undefined, body: typeof bd === 'string' ? bd : undefined };
  }

  if (typeof raw !== 'string') return {};

  const cleaned = cleanJSONString(raw);

  // If string starts with '{' or is a JSON payload
  if (cleaned.startsWith('{')) {
    const parsed = safeParseJSON(cleaned);
    if (parsed && typeof parsed === 'object') {
      return {
        overview: parsed.overview || parsed.description,
        body: parsed.contentMarkdown || parsed.markdown || parsed.content || parsed.text,
      };
    }

    // Truncated / malformed JSON string handling:
    let overview: string | undefined;
    let body: string | undefined;

    // Match overview even if truncated
    const overviewMatch = cleaned.match(/"overview"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"|"\s*\}|$)/);
    if (overviewMatch) {
      overview = overviewMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }

    // Match contentMarkdown even if truncated at the end of string
    const contentMatch = cleaned.match(/"contentMarkdown"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"|"\s*\}|$)/);
    if (contentMatch) {
      body = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }

    return { overview, body };
  }

  return { body: cleaned };
}

/**
 * Deep recursive extraction of task content to eliminate raw JSON strings
 */
function parseTaskContent(data: any): Record<string, any> {
  if (!data) return {};

  let result: Record<string, any> = {};

  if (typeof data === 'string') {
    const parsed = safeParseJSON(data);
    if (parsed && typeof parsed === 'object') {
      result = parsed;
    } else {
      result = { overview: data };
    }
  } else if (typeof data === 'object') {
    result = { ...data };
  }

  // Iterate through object keys and expand nested JSON strings
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === 'string') {
      const parsed = safeParseJSON(val);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        Object.assign(result, parsed);
        delete result[key];
      }
    }
  }

  return result;
}

// ----------------------------------------------------
// 1. DEEP TECHNICAL MASTERCLASS RENDERER
// ----------------------------------------------------
function DeepTechnicalRenderer({ content, solution, userAnswer, setUserAnswer }: any) {
  const extractedFromMarkdown = extractCleanText(content.markdown || content.rawContent);
  const overview = content.overview || content.description || extractedFromMarkdown.overview;
  const rawMd = extractedFromMarkdown.body || content.markdown || content.rawContent;
  const markdown = typeof rawMd === 'string' && !cleanJSONString(rawMd).startsWith('{') ? rawMd : null;
  const reflectionQuestions = content.reflectionQuestions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Executive Overview Banner */}
      {overview && (
        <div style={{
          padding: 20,
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(162, 155, 254, 0.05) 100%)',
          border: '1px solid rgba(108, 92, 231, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--accent-secondary)' }}>
            <Zap size={18} />
            <h4 style={{ fontSize: 14, fontWeight: 700 }}>CTO Architecture Briefing</h4>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)' }}>{overview}</p>
        </div>
      )}

      {/* Main Masterclass Content Body — rendered as real Markdown */}
      {markdown && (
        <div className="markdown-body" style={{
          background: 'rgba(255, 255, 255, 0.02)',
          padding: 24,
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      )}

      {/* Reflection Questions */}
      {reflectionQuestions.length > 0 && (
        <div style={{
          padding: 20,
          borderRadius: 14,
          background: 'rgba(253, 203, 110, 0.08)',
          border: '1px solid rgba(253, 203, 110, 0.2)',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={18} /> Senior Reflection Questions:
          </h4>
          <ol style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reflectionQuestions.map((q: string, i: number) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Submission Area */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Your Architectural Synthesis & Answers to Reflection Questions:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Synthesize your key takeaways and answer the CTO reflection questions..."
          rows={8}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. COMPANY CASE STUDY RENDERER
// ----------------------------------------------------
function CaseStudyRenderer({ content, solution, userAnswer, setUserAnswer }: any) {
  const [readingDone, setReadingDone] = useState(false);
  const company = content.company || 'Tech Unicorn (Adyen / Booking.com)';
  const scale = content.scaleContext || content.scale || 'High QPS Distributed Workload';
  const problem = content.theProblem || content.problem || content.overview || content.description || 'High-volume concurrency and consistency challenge at scale.';
  const architecture = content.theArchitecture || content.architecture || content.markdown;
  const tradeoffs = content.tradeoffsMade || content.tradeoffs || [];
  const questions = content.questions || [];
  const keyLessons = content.keyLessons || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Scale & Problem Header */}
      <div style={{
        padding: 20, borderRadius: 14,
        background: 'rgba(238, 82, 83, 0.08)', border: '1px solid rgba(238, 82, 83, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} /> Industrial Scale Context — {company}
          </span>
          <span className="badge badge-hard">{scale}</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)' }}>
          <strong>The Engineering Challenge:</strong> {problem}
        </p>
      </div>

      {/* Architectural Solution */}
      {architecture && (
        <div className="markdown-body" style={{
          padding: 20, borderRadius: 14,
          background: 'rgba(0, 184, 148, 0.08)', border: '1px solid rgba(0, 184, 148, 0.2)',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>
            🏗️ Production Architecture Solution:
          </h4>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{architecture}</ReactMarkdown>
        </div>
      )}

      {/* Tradeoffs */}
      {tradeoffs.length > 0 && (
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: 10 }}>⚖️ Key Tradeoffs Made:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {tradeoffs.map((t: string, idx: number) => (
              <div key={idx} style={{ padding: 12, borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: 13, color: 'var(--text-secondary)' }}>• {t}</div>
            ))}
          </div>
        </div>
      )}

      {/* Key Lessons */}
      {keyLessons.length > 0 && (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', marginBottom: 8 }}>📚 Key Lessons:</h4>
          <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            {keyLessons.map((l: string, i: number) => <li key={i} style={{ marginBottom: 4 }}>{l}</li>)}
          </ul>
        </div>
      )}

      {/* Phase Gate: Read First → Then Answer */}
      {!readingDone ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            <BookOpen size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Read the case study carefully before answering questions.
          </p>
          <button
            onClick={() => setReadingDone(true)}
            className="btn-accent"
            style={{ padding: '12px 32px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            I&apos;ve Finished Reading <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <>
          {/* Questions revealed after reading */}
          {questions.length > 0 && (
            <div style={{ padding: 20, borderRadius: 14, background: 'rgba(253, 203, 110, 0.08)', border: '1px solid rgba(253, 203, 110, 0.2)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)', marginBottom: 12 }}>
                <HelpCircle size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Architectural Analysis Questions:
              </h4>
              <ol style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {questions.map((q: any, i: number) => (
                  <li key={i}>{typeof q === 'string' ? q : q.question}</li>
                ))}
              </ol>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Your Analysis & Architectural Critique:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Answer the questions above. How would you optimize this architecture further?"
              rows={6}
              style={textareaStyle}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 3. P0 PRODUCTION INCIDENT RENDERER
// ----------------------------------------------------
function ProductionIncidentRenderer({ content, solution, userAnswer, setUserAnswer }: any) {
  const metrics = content.metricsDashboard || content.metrics || 'CPU: 99.4%, DB Connection Pool: 100/100, HTTP 504 Timeouts';
  const logs = content.logsSnippet || content.logs || 'ERROR [db-pool] ConnectionAcquireTimeoutException: Unable to acquire connection in 30000ms';
  const description = content.incidentDescription || content.description || content.overview || 'Critical production degradation impacting European payment endpoints.';
  const srePrompts = content.srePrompts || [
    'What is your immediate mitigation step?',
    'What root cause do these metrics point to?',
    'How do you prevent this from recurring?'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Outage Header */}
      <div style={{
        padding: 20,
        borderRadius: 14,
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', marginBottom: 8 }}>
          <ShieldAlert size={22} className="animate-pulse" />
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>P0 CRITICAL OUTAGE IN PROGRESS</h3>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>{description}</p>
      </div>

      {/* Metrics Callout */}
      <div style={{ padding: 14, borderRadius: 10, background: '#111827', border: '1px solid #374151', fontSize: 13, fontFamily: 'monospace', color: '#f87171' }}>
        📊 <strong>Metrics Snapshot:</strong> {metrics}
      </div>

      {/* Terminal Logs */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={14} /> Production Log Stream:
        </div>
        <pre style={{
          padding: 16, borderRadius: 12, background: '#030712', border: '1px solid rgba(255,255,255,0.1)',
          color: '#ef4444', fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5
        }}>
          {logs}
        </pre>
      </div>

      {/* SRE Questions */}
      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: 10 }}>
          🚨 SRE Immediate Incident Protocol:
        </h4>
        <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {srePrompts.map((p: string, i: number) => <li key={i}>{p}</li>)}
        </ul>
      </div>

      {/* Response Box */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Your On-Call Action Plan & Root Cause Diagnosis:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="1. Immediate mitigation...\n2. Root cause identification...\n3. Permanent resolution..."
          rows={8}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. CODE REVIEW RENDERER
// ----------------------------------------------------
function CodeReviewRenderer({ content, solution, userAnswer, setUserAnswer }: any) {
  const snippet = content.codeSnippet || content.code || '// Pull request snippet loaded';
  const instructions = content.instructions || 'Identify the 3 critical issues in this pull request and write corrected versions.';
  const flaws = content.flaws || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{instructions}</p>

      {/* Code Snippet */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
          Pull Request Code to Review:
        </div>
        <pre style={{
          padding: 18, borderRadius: 12, background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)',
          color: '#f8fafc', fontSize: 13, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6
        }}>
          {snippet}
        </pre>
      </div>

      {flaws.length > 0 && (
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(253, 203, 110, 0.1)', border: '1px solid rgba(253, 203, 110, 0.3)', fontSize: 13, color: 'var(--warning)' }}>
          🔍 This Pull Request contains <strong>{flaws.length} critical flaws</strong> (Security, Performance, Architecture). Identify all of them below.
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Your Pull Request Review Comments & Suggested Fixes:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="List line numbers, identified vulnerabilities, and clean refactored code..."
          rows={8}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. CODING & AI ENGINEERING TASK RENDERER
// ----------------------------------------------------
function CodingTaskRenderer({ taskTitle, content, solution, setUserAnswer }: any) {
  const description = content.description || content.conceptExplanation || content.overview || `Production coding challenge for ${taskTitle}`;
  const requirements = content.requirements || ['Implement high-performance solution', 'Handle invalid input edge cases'];
  const starterCode = content.starterCode || content.codeExercise || '// Write your JS solution here\nfunction solution(input) {\n  return input;\n}';
  const testCases = content.testCases || [
    { input: '[2, 7, 11, 15], 9', expected: '[0,1]', description: 'Basic test case' }
  ];
  const modelSolution = solution?.code || solution?.solutionCode || content.modelSolution || content.solution;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)' }}>
        {description}
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--accent-secondary)' }}>
          📌 Requirements:
        </h4>
        <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          {requirements.map((req: string, i: number) => <li key={i} style={{ marginBottom: 4 }}>{req}</li>)}
        </ul>
      </div>

      <CodePlayground
        initialCode={starterCode}
        testCases={testCases as TestCase[]}
        solutionCode={modelSolution}
        onCodeChange={(code) => setUserAnswer(code)}
      />
    </div>
  );
}

// ----------------------------------------------------
// 6. IELTS SPEAKING RENDERER
// ----------------------------------------------------
function IELTSSpeakingRenderer({ content, userAnswer, setUserAnswer }: any) {
  const cueCard = content.cueCard;
  const vocabulary = content.vocabulary || content.band85Vocabulary || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {cueCard && (
        <div style={{ padding: 20, borderRadius: 14, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>
            🗣️ IELTS Speaking Cue Card:
          </h4>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{cueCard.topic}</p>
          {cueCard.bulletPoints && (
            <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
              {cueCard.bulletPoints.map((b: string, i: number) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
      )}

      {vocabulary.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Band 8.5+ Words to Use:</span>
          {vocabulary.map((w: string, idx: number) => (
            <span key={idx} style={{ padding: '4px 10px', borderRadius: 16, background: 'rgba(162, 155, 254, 0.15)', color: 'var(--accent-secondary)', fontSize: 12, fontWeight: 600 }}>
              {w}
            </span>
          ))}
        </div>
      )}

      {/* 🎤 Mic Recording */}
      <SpeechRecorder
        onTranscript={(text) => setUserAnswer(text)}
        existingText={userAnswer}
        placeholder="Tap the mic and speak your answer..."
      />

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Transcript (edit if needed):
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your speech will be transcribed here automatically, or type manually..."
          rows={6}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 7. IELTS WRITING RENDERER
// ----------------------------------------------------
function IELTSWritingRenderer({ content, userAnswer, setUserAnswer }: any) {
  const prompt = content.prompt;
  const wordCount = content.wordCount || 250;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {prompt && (
        <div style={{ padding: 20, borderRadius: 14, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: '#10b981', marginBottom: 8 }}>
            ✍️ IELTS Academic Writing Essay Prompt:
          </h4>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)' }}>{prompt}</p>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Requirement: Minimum {wordCount} words.
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Your Essay Draft:
          </label>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Word Count: {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0} words
          </span>
        </div>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Write your 250+ word Band 8.5 essay here..."
          rows={14}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 8. IELTS READING RENDERER
// ----------------------------------------------------
function IELTSReadingRenderer({ content, solution, userAnswer, setUserAnswer }: any) {
  const passage = content.passage;
  const questions = content.questions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {passage && (
        <div style={{
          padding: 20, borderRadius: 14, background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 300, overflowY: 'auto', fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)'
        }}>
          {passage}
        </div>
      )}

      {questions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-secondary)' }}>Comprehension Questions:</h4>
          {questions.map((q: any, idx: number) => (
            <div key={idx} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{idx + 1}. {q.question}</p>
              {q.options && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {q.options.map((opt: string, oIdx: number) => (
                    <div key={oIdx} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      • {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Your Answers (e.g. 1. Raft Consensus, 2. B, 3. True):
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answers to each reading question..."
          rows={4}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 9. VOCABULARY RENDERER
// ----------------------------------------------------
function VocabularyRenderer({ content, userAnswer, setUserAnswer }: any) {
  const words = content.words || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {words.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {words.map((w: any, idx: number) => (
            <div key={idx} style={{
              padding: 16, borderRadius: 14, background: 'rgba(232, 67, 147, 0.08)',
              border: '1px solid rgba(232, 67, 147, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#e84393' }}>{w.word}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.phonetic} • {w.partOfSpeech}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.5 }}>{w.definition}</p>
              {w.exampleSentence && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  &ldquo;{w.exampleSentence}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Write a 3-sentence technical paragraph using at least 3 of these vocabulary words:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Compose your technical practice paragraph..."
          rows={6}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 10. GRAMMAR RENDERER
// ----------------------------------------------------
function GrammarRenderer({ content, userAnswer, setUserAnswer }: any) {
  const explanation = content.explanation;
  const rules = content.band8UpgradeRules || content.rules || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {explanation && <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)' }}>{explanation}</p>}

      {rules.length > 0 && (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(162, 155, 254, 0.1)', border: '1px solid rgba(162, 155, 254, 0.3)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: 8 }}>
            💡 Band 8.5 Grammar Upgrade Rules:
          </h4>
          <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {rules.map((r: string, i: number) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Your Drill Submission:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Write your grammar transformation sentences..."
          rows={6}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 11. DEFAULT STRUCTURED FALLBACK RENDERER
// ----------------------------------------------------
function DefaultStructuredRenderer({ content, solution, userAnswer, setUserAnswer }: any) {
  const textFields = Object.entries(content).filter(([k, v]) => typeof v === 'string' && k !== 'rawContent');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {textFields.length > 0 ? (
        textFields.map(([key, val]: [string, any], idx) => (
          <div key={idx} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'capitalize', marginBottom: 6 }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </h4>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {val}
            </div>
          </div>
        ))
      ) : (
        <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)' }}>
          {content.description || content.overview || 'Complete the exercise according to senior engineering standards.'}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
          Your Answer / Submission:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your response..."
          rows={8}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: 16,
  borderRadius: 12,
  background: '#0a0f1d',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'var(--text-primary)',
  fontSize: 14,
  lineHeight: 1.6,
  outline: 'none',
  resize: 'vertical',
};
