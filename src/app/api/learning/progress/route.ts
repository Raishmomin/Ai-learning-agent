// ============================================
// API: Learning Progress — GET
// Returns real database metrics for analytics dashboard
// ============================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

export async function GET() {
  try {
    // Fetch last 14 days of progress records
    const progressList = await prisma.learningProgress.findMany({
      where: { userId: USER_ID },
      orderBy: { date: 'desc' },
      take: 14,
    });

    const totalCompleted = await prisma.learningTask.count({
      where: {
        plan: { userId: USER_ID },
        status: 'COMPLETED',
      },
    });

    const avgScoreResult = await prisma.learningTask.aggregate({
      where: {
        plan: { userId: USER_ID },
        status: 'COMPLETED',
        score: { not: null },
      },
      _avg: { score: true },
    });

    const latestStreak = progressList[0]?.streak ?? 0;
    const activeDays = progressList.filter((p: any) => p.tasksCompleted > 0).length;

    return NextResponse.json({
      progress: progressList.reverse(),
      stats: {
        totalCompleted,
        bestStreak: latestStreak,
        avgScore: Math.round(avgScoreResult._avg.score || 0),
        totalDays: activeDays,
      },
    });
  } catch (error) {
    console.error('[Progress GET]', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
