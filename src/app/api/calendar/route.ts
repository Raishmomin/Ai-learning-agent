// ============================================
// API: Calendar Sync — POST & GET
// Generates Google Calendar Quick-Add links or .ics events
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, description, startTime, durationMinutes } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const start = startTime ? new Date(startTime) : new Date();
    const end = new Date(start.getTime() + (durationMinutes || 60) * 60 * 1000);

    const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description || '')}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}`;

    return NextResponse.json({
      googleCalendarUrl,
      event: { title, start: start.toISOString(), end: end.toISOString() },
    });
  } catch (error) {
    console.error('[Calendar POST]', error);
    return NextResponse.json({ error: 'Failed to generate calendar event' }, { status: 500 });
  }
}
