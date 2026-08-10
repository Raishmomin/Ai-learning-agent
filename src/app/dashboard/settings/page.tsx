'use client';

import { useState } from 'react';
import { Settings, Save, Bell, Brain, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    userName: 'Raish',
    email: '',
    timezone: 'Asia/Kolkata',
    dailyHours: 4,
    telegramBotToken: '',
    telegramChatId: '',
    openrouterApiKey: '',
    googleAiApiKey: '',
    morningBriefTime: '08:00',
    eveningReminderTime: '18:00',
    notifyTelegram: true,
    notifyEmail: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, save to DB/env
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 700 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800 }}>
        <span className="gradient-text">Settings</span>
      </h2>

      {/* Profile */}
      <Section title="Profile" icon={<Brain size={18} />}>
        <Field label="Name" value={config.userName} onChange={v => setConfig(c => ({ ...c, userName: v }))} />
        <Field label="Email" value={config.email} onChange={v => setConfig(c => ({ ...c, email: v }))} placeholder="your@email.com" />
        <Field label="Timezone" value={config.timezone} onChange={v => setConfig(c => ({ ...c, timezone: v }))} />
        <Field label="Daily Study Hours" value={String(config.dailyHours)} onChange={v => setConfig(c => ({ ...c, dailyHours: Number(v) }))} type="number" />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={18} />}>
        <Field label="Morning Brief Time" value={config.morningBriefTime} onChange={v => setConfig(c => ({ ...c, morningBriefTime: v }))} type="time" />
        <Field label="Evening Reminder" value={config.eveningReminderTime} onChange={v => setConfig(c => ({ ...c, eveningReminderTime: v }))} type="time" />
        <Toggle label="Telegram Notifications" value={config.notifyTelegram} onChange={v => setConfig(c => ({ ...c, notifyTelegram: v }))} />
        <Toggle label="Email Notifications" value={config.notifyEmail} onChange={v => setConfig(c => ({ ...c, notifyEmail: v }))} />
      </Section>

      {/* API Keys */}
      <Section title="API Configuration" icon={<Globe size={18} />}>
        <Field label="OpenRouter API Key" value={config.openrouterApiKey} onChange={v => setConfig(c => ({ ...c, openrouterApiKey: v }))} placeholder="sk-or-..." type="password" />
        <Field label="Google AI API Key" value={config.googleAiApiKey} onChange={v => setConfig(c => ({ ...c, googleAiApiKey: v }))} placeholder="AIza..." type="password" />
        <Field label="Telegram Bot Token" value={config.telegramBotToken} onChange={v => setConfig(c => ({ ...c, telegramBotToken: v }))} placeholder="123456:ABC-DEF..." type="password" />
        <Field label="Telegram Chat ID" value={config.telegramChatId} onChange={v => setConfig(c => ({ ...c, telegramChatId: v }))} placeholder="Your chat ID" />
      </Section>

      <button onClick={handleSave} className="btn-accent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px' }}>
        <Save size={16} />
        {saved ? '✅ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--accent-secondary)' }}>
        {icon}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, outline: 'none',
          fontFamily: 'Inter, sans-serif',
        }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: value ? 'var(--accent-primary)' : 'var(--bg-primary)',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3,
          left: value ? 23 : 3, transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}
