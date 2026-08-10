// ============================================
// Dashboard Layout — Responsive Glassmorphism Navigation
// Includes mobile top bar, hamburger menu drawer, and desktop sidebar
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Swords, TrendingUp,
  Briefcase, Settings, Zap, Brain, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: "Today's Tasks", icon: LayoutDashboard },
  { href: '/dashboard/practice', label: 'Practice', icon: BookOpen },
  { href: '/dashboard/interview', label: 'Mock Interview', icon: Swords },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/applications', label: 'Job Tracker', icon: Briefcase },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Mobile Top Bar */}
      <header className="mobile-header" style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800 }} className="gradient-text">
            Career OS
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-secondary"
          style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
          />
        )}

        {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 8px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.4)',
            }}>
              <Brain size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.5 }}>
                <span className="gradient-text">Career OS</span>
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                Senior Engineer Target
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer Pro Tip */}
          <div style={{
            padding: 16, borderRadius: 'var(--radius-md)',
            background: 'rgba(108, 92, 231, 0.08)', border: '1px solid rgba(108, 92, 231, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={14} color="var(--accent-secondary)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-secondary)' }}>Senior Standard</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Netherlands 🇳🇱 Estonia 🇪🇪 Germany 🇩🇪 Ireland 🇮🇪
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
