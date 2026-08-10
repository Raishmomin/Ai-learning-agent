// ============================================
// API: Evaluate Answer — POST
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer } from '@/lib/learning/engine';

export async function POST(req: NextRequest) {
  try {
    const { taskId, answer } = await req.json();

    if (!taskId || !answer) {
      return NextResponse.json({ error: 'taskId and answer are required' }, { status: 400 });
    }

    const result = await evaluateAnswer(taskId, answer);

    return NextResponse.json({
      score: result.score,
      feedback: result.feedback,
      strengths: result.strengths,
      improvements: result.improvements,
      nextSteps: result.nextSteps,
      quality: result.quality,
    });
  } catch (error) {
    console.error('[Evaluate POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Evaluation failed' },
      { status: 500 }
    );
  }
}
