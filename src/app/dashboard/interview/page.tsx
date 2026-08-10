'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, RotateCcw, Swords, Brain, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INTERVIEW_TYPES = [
  { id: 'DSA', label: 'DSA / Coding', icon: '💻', description: 'Algorithm & data structure questions' },
  { id: 'SYSTEM_DESIGN', label: 'System Design', icon: '🏗️', description: 'Architecture & scalability' },
  { id: 'BEHAVIOURAL', label: 'Behavioural', icon: '🤝', description: 'STAR method & soft skills' },
];

export default function InterviewPage() {
  const [type, setType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Speak AI message using SpeechSynthesis
  const speakText = useCallback((text: string) => {
    if (!voiceMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Clean markdown for speech
    const clean = text.replace(/[#*`_~\[\]()>|]/g, '').replace(/\n+/g, '. ').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-start listening after AI finishes speaking
      if (voiceMode) startListening();
    };
    window.speechSynthesis.speak(utterance);
  }, [voiceMode]);

  // Start SpeechRecognition for user input
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + (interim ? ' ' + interim : ''));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startInterview = async (interviewType: string) => {
    setType(interviewType);
    setMessages([]);
    setStreaming(true);

    try {
      const res = await fetch('/api/learning/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Start the interview.' }], type: interviewType }),
      });

      if (!res.body) throw new Error('No response body');
      await streamResponse(res.body, []);
    } catch (err) {
      console.error('Interview start failed:', err);
      setMessages([{ role: 'assistant', content: 'Failed to start interview. Please check your API configuration.' }]);
    } finally {
      setStreaming(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    stopListening();

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/learning/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          type,
        }),
      });

      if (!res.body) throw new Error('No response body');
      await streamResponse(res.body, newMessages);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setStreaming(false);
    }
  };

  const streamResponse = async (body: ReadableStream<Uint8Array>, currentMessages: Message[]) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content || '';
          if (token) {
            fullContent += token;
            setMessages([...currentMessages, { role: 'assistant', content: fullContent }]);
          }
        } catch { /* skip malformed */ }
      }
    }

    if (fullContent) {
      setMessages([...currentMessages, { role: 'assistant', content: fullContent }]);
      // Speak the AI response in voice mode
      speakText(fullContent);
    }
  };

  const toggleVoiceMode = () => {
    if (voiceMode) {
      window.speechSynthesis?.cancel();
      stopListening();
      setVoiceMode(false);
    } else {
      setVoiceMode(true);
    }
  };

  // Type selection screen
  if (!type) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, paddingTop: 48 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--accent-gradient)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Swords size={28} color="white" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            <span className="gradient-text">Mock Interview</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
            Practice with an AI interviewer. Choose your interview type:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, width: '100%', maxWidth: 800 }}>
          {INTERVIEW_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => startInterview(t.id)}
              className="glass-card"
              style={{ padding: 28, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }}
            >
              <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>{t.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Brain size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            {INTERVIEW_TYPES.find(t => t.id === type)?.label} Interview
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Voice Mode Toggle */}
          <button
            onClick={toggleVoiceMode}
            className={voiceMode ? 'btn-accent' : 'btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
            title={voiceMode ? 'Disable Voice Mode' : 'Enable Voice Mode'}
          >
            {voiceMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {voiceMode ? '🎤 Voice On' : 'Voice Off'}
          </button>
          <button onClick={() => { setType(null); setMessages([]); window.speechSynthesis?.cancel(); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
            <RotateCcw size={14} /> New Session
          </button>
        </div>
      </div>

      {/* Voice Mode Indicator */}
      {voiceMode && (
        <div style={{
          padding: '10px 16px', marginBottom: 12, borderRadius: 10,
          background: isSpeaking ? 'rgba(108, 92, 231, 0.1)' : isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${isSpeaking ? 'rgba(108, 92, 231, 0.3)' : isListening ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          color: isSpeaking ? '#a29bfe' : isListening ? '#ef4444' : '#10b981',
        }}>
          {isSpeaking ? (
            <>
              <Volume2 size={16} className="animate-pulse" /> AI is speaking...
              <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{
                    width: 3, height: `${6 + Math.sin(Date.now() / 200 + i) * 6}px`,
                    background: '#a29bfe', borderRadius: 2,
                    animation: `pulse 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                  }} />
                ))}
              </div>
            </>
          ) : isListening ? (
            <>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
              Listening... speak your answer
            </>
          ) : (
            <>🎤 Voice mode active — AI will speak, then listen for your response</>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '14px 18px', borderRadius: 16,
              background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              fontSize: 14, lineHeight: 1.7,
            }}>
              {msg.role === 'assistant' ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> AI is thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 12, padding: '16px 0', borderTop: '1px solid var(--border)', alignItems: 'flex-end' }}>
        {/* Mic toggle in voice mode */}
        {voiceMode && (
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: isListening
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              boxShadow: isListening ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none',
            }}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={voiceMode ? "Speak or type your response..." : "Type your response... (Enter to send, Shift+Enter for new line)"}
          style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '12px 16px', color: 'var(--text-primary)',
            fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif',
            minHeight: 48, maxHeight: 120,
          }}
          rows={1}
          disabled={streaming}
        />
        <button onClick={sendMessage} className="btn-accent" disabled={streaming || !input.trim()} style={{ padding: '12px 20px' }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
