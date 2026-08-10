// ============================================
// Cron Endpoint — 6:00 AM Daily Task Generation & Briefing Dispatch
// Protected by CRON_SECRET header or query param
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyTasks, getDailySummary } from '@/lib/learning/engine';
import { sendTelegramNotification } from '@/lib/notifications/telegram';

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const searchParams = req.nextUrl.searchParams;
  const secretParam = searchParams.get('secret');

  const expectedSecret = process.env.CRON_SECRET || 'career-os-cron-secret-key';
  const providedSecret = authHeader?.replace('Bearer ', '') || secretParam;

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  const userId = process.env.DEFAULT_USER_ID || 'default-user';

  try {
    // 1. Generate 11 tasks for today
    const tasks = await generateDailyTasks(userId);

    // 2. Fetch daily summary briefing
    const summary = await getDailySummary(userId);

    // 3. Format Telegram message
    const telegramMessage = `
🚀 *Career OS Morning Briefing — 6:00 AM IST*
📅 ${summary.date} | ${summary.greeting}

🔥 *Streak:* ${summary.streak} Days | *Weekly Progress:* ${summary.weeklyProgress}%
🎯 *${summary.ieltsFocusToday || 'IELTS Focus Active'}*

📚 *Today's 11 High-Stakes Modules:*
${summary.tasksToday.map((t, idx) => `${idx + 1}. *[${t.type}]* ${t.title} (${t.estimatedMinutes}m)`).join('\n')}

💡 _"${summary.motivationalQuote}"_

⚡ Time to execute your senior engineering transformation!
    `.trim();

    // 4. Send Telegram notification
    await sendTelegramNotification(telegramMessage);

    return NextResponse.json({
      success: true,
      message: 'Daily cron executed successfully.',
      date: summary.date,
      taskCount: tasks.length,
      summary,
    });
  } catch (err: any) {
    console.error('[Daily Cron Error]:', err);
    return NextResponse.json({ error: err?.message || 'Cron execution failed' }, { status: 500 });
  }
}
