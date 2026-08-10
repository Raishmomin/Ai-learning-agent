// ============================================
// SpeechRecorder — Mic recording with live transcription
// Uses MediaRecorder for audio capture + SpeechRecognition for free transcription
// ============================================

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Square, Play, Pause, RotateCcw } from 'lucide-react';

interface SpeechRecorderProps {
  onTranscript: (text: string) => void;
  existingText?: string;
  placeholder?: string;
}

// Extend Window type for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export function SpeechRecorder({ onTranscript, existingText = '', placeholder }: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(existingText);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(0);
  const [supported, setSupported] = useState(true);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
    }
  }, []);

  // Sync external text
  useEffect(() => {
    if (existingText && !transcript) setTranscript(existingText);
  }, [existingText]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio level visualization
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateLevel = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(avg / 128);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // MediaRecorder for audio blob
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(animFrameRef.current);
        setLevel(0);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

      // SpeechRecognition for live transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = transcript;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += (finalTranscript ? ' ' : '') + result[0].transcript;
              setTranscript(finalTranscript);
              onTranscript(finalTranscript);
            } else {
              interim += result[0].transcript;
            }
          }
          // Show interim results in real-time
          if (interim) {
            setTranscript(finalTranscript + (finalTranscript ? ' ' : '') + interim);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // Duration timer
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);

      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access is required for speech recording. Please allow mic access in your browser settings.');
    }
  }, [transcript, onTranscript]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  }, []);

  const resetRecording = () => {
    setTranscript('');
    setAudioUrl(null);
    setDuration(0);
    onTranscript('');
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  if (!supported) {
    return (
      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: 13, color: '#ef4444' }}>
        ⚠️ Speech recording requires Chrome or Edge browser with microphone access.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Recording Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
        borderRadius: 14, background: isRecording ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
        border: `1px solid ${isRecording ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        transition: 'all 0.3s ease',
      }}>
        {/* Mic button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isRecording
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            boxShadow: isRecording
              ? `0 0 0 ${4 + level * 12}px rgba(239, 68, 68, ${0.15 + level * 0.15})`
              : '0 2px 8px rgba(16, 185, 129, 0.3)',
            transition: 'box-shadow 0.1s ease',
          }}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? <Square size={20} /> : <Mic size={20} />}
        </button>

        {/* Status */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 14, fontWeight: 700,
            color: isRecording ? '#ef4444' : '#10b981',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {isRecording ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                Recording... {formatDuration(duration)}
              </>
            ) : audioUrl ? (
              'Recording complete'
            ) : (
              'Tap the mic to start speaking'
            )}
          </div>
          {isRecording && (
            <div style={{ display: 'flex', gap: 2, marginTop: 6, height: 16, alignItems: 'flex-end' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 3, borderRadius: 2,
                    background: 'var(--accent-primary)',
                    height: `${Math.max(3, level * (8 + Math.sin(Date.now() / 100 + i) * 8))}px`,
                    transition: 'height 0.1s ease',
                    opacity: 0.4 + level * 0.6,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Playback & Reset */}
        {audioUrl && !isRecording && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={togglePlayback} style={smallBtnStyle} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={resetRecording} style={smallBtnStyle} title="Re-record">
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Hidden audio player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}

      {/* Live transcript preview */}
      {transcript && (
        <div style={{
          padding: 16, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: 14, lineHeight: 1.7,
          color: 'var(--text-primary)', maxHeight: 200, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Live Transcript:
          </div>
          {transcript}
        </div>
      )}
    </div>
  );
}

const smallBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
