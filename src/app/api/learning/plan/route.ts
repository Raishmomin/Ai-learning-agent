// ============================================
// API: Learning Plan — POST (initialize plan)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CURRICULUM } from '@/lib/learning/curriculum';

const USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

export async function GET() {
  try {
    const plan = await prisma.learningPlan.findUnique({
      where: { userId: USER_ID },
      include: {
        topics: { orderBy: { weekNumber: 'asc' } },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('[Plan GET]', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userName = body.userName || 'Learner';

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: USER_ID } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: USER_ID,
          name: userName,
          email: body.email || 'learner@agent.local',
        },
      });
    }

    // Check for existing plan
    const existing = await prisma.learningPlan.findUnique({ where: { userId: USER_ID } });
    if (existing) {
      return NextResponse.json({ plan: existing, message: 'Plan already exists' });
    }

    // Create 6-month plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    const plan = await prisma.learningPlan.create({
      data: {
        userId: USER_ID,
        title: '6-Month Career Accelerator',
        description: 'Intensive full-stack + interview prep plan targeting NL/EE relocation',
        startDate,
        endDate,
        config: {
          timezone: 'Asia/Kolkata',
          dailyHours: 4,
          weekendHours: 10,
          notifications: { telegram: true, email: false },
        },
      },
    });

    // Seed all topics from curriculum
    for (const week of CURRICULUM) {
      for (const topic of week.topics) {
        await prisma.learningTopic.create({
          data: {
            planId: plan.id,
            title: topic.title,
            description: topic.description,
            category: topic.category as never,
            weekNumber: week.weekNumber,
          },
        });
      }
    }

    return NextResponse.json({
      plan,
      message: `Plan created! ${CURRICULUM.length} weeks of curriculum loaded.`,
      totalTopics: CURRICULUM.reduce((acc, w) => acc + w.topics.length, 0),
    });
  } catch (error) {
    console.error('[Plan POST]', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
