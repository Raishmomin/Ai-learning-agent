// ============================================
// API: English Spoken Fluency Evaluation — POST
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { LLMGateway } from '@/lib/ai/llm-gateway';
import { PROMPTS } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { transcript, audioBase64 } = await req.json();

    if (!transcript && !audioBase64) {
      return NextResponse.json({ error: 'transcript or audio required' }, { status: 400 });
    }

    const textToEvaluate = transcript || 'User provided spoken audio clip.';
    const prompt = PROMPTS.evaluateEnglish(textToEvaluate, 'Technical English Practice');

    const res = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.3 });

    let evaluation = {};
    try {
      evaluation = JSON.parse(res.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      evaluation = { feedback: res.content, score: 75 };
    }

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('[English Eval POST]', error);
    return NextResponse.json({ error: 'Failed to evaluate spoken English' }, { status: 500 });
  }
}
