// ============================================
// API: Job Applications — GET, POST, PUT, DELETE
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

export async function GET() {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: USER_ID },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('[Applications GET]', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, position, location, url, status, salary, notes } = body;

    if (!company || !position) {
      return NextResponse.json({ error: 'Company and position are required' }, { status: 400 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId: USER_ID,
        company,
        position,
        location,
        url,
        status: status || 'SAVED',
        salary,
        notes,
        appliedAt: status === 'APPLIED' ? new Date() : null,
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('[Applications POST]', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, coverLetter, followUpAt } = body;

    if (!id) return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(coverLetter !== undefined ? { coverLetter } : {}),
        ...(followUpAt !== undefined ? { followUpAt: new Date(followUpAt) } : {}),
        ...(status === 'APPLIED' ? { appliedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('[Applications PUT]', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
