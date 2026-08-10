// ============================================
// API: Daily Briefing — GET (for Telegram/Dashboard)
// ============================================

import { NextResponse } from 'next/server';
import { getDailySummary } from '@/lib/learning/engine';

const USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

export async function GET() {
  try {
    const summary = await getDailySummary(USER_ID);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[DailyBrief GET]', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}
