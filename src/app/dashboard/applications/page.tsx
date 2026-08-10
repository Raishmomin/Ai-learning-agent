'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Plus, ExternalLink, Calendar, MapPin, X } from 'lucide-react';

interface Application {
  id: string;
  company: string;
  position: string;
  location: string;
  status: string;
  appliedAt: string | null;
  url: string;
}

const STATUSES = ['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'];
const STATUS_COLORS: Record<string, string> = {
  SAVED: 'var(--text-muted)',
  APPLIED: 'var(--info)',
  SCREENING: 'var(--warning)',
  INTERVIEW: 'var(--accent-primary)',
  OFFER: 'var(--success)',
  REJECTED: 'var(--danger)',
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', position: '', location: '', url: '' });

  const fetchApps = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.applications) setApps(data.applications);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const addApp = async () => {
    if (!newApp.company || !newApp.position) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      const data = await res.json();
      if (data.application) {
        setApps(prev => [data.application, ...prev]);
        setNewApp({ company: '', position: '', location: '', url: '' });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to add application:', err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    try {
      await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800 }}>
          <span className="gradient-text">Job Tracker</span>
        </h2>
        <button onClick={() => setShowForm(true)} className="btn-accent" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Pipeline Stats */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {STATUSES.map(s => {
          const count = apps.filter(a => a.status === s).length;
          return (
            <div key={s} style={{
              padding: '12px 20px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              minWidth: 120, textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: STATUS_COLORS[s] }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.toLowerCase()}</div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>New Application</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input value={newApp.company} onChange={e => setNewApp(p => ({ ...p, company: e.target.value }))} placeholder="Company" style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }} />
            <input value={newApp.position} onChange={e => setNewApp(p => ({ ...p, position: e.target.value }))} placeholder="Position" style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }} />
            <input value={newApp.location} onChange={e => setNewApp(p => ({ ...p, location: e.target.value }))} placeholder="Location (e.g. Amsterdam, NL)" style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }} />
            <input value={newApp.url} onChange={e => setNewApp(p => ({ ...p, url: e.target.value }))} placeholder="Job URL" style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }} />
          </div>
          <button onClick={addApp} className="btn-accent" style={{ marginTop: 12 }}>Save Application</button>
        </div>
      )}

      {/* Application Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {apps.map((app, i) => (
          <div key={app.id} className="task-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 4, height: 48, borderRadius: 2, background: STATUS_COLORS[app.status], flexShrink: 0 }} />
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--accent-secondary)', flexShrink: 0 }}>
              {app.company[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{app.position}</h4>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={11} /> {app.company}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {app.location}</span>
                {app.appliedAt && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {app.appliedAt}</span>}
              </div>
            </div>
            <select
              value={app.status}
              onChange={(e) => updateStatus(app.id, e.target.value)}
              style={{ padding: '6px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: STATUS_COLORS[app.status], fontSize: 12, fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {app.url && (
              <a href={app.url} target="_blank" rel="noopener" style={{ color: 'var(--text-muted)' }}><ExternalLink size={16} /></a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
