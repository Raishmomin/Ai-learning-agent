// ============================================
// API: Outreach & Cover Letter Generator — POST
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { LLMGateway } from '@/lib/ai/llm-gateway';
import { PROMPTS } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { type, company, position, recipientName, techStack, jobDescription } = await req.json();

    let prompt = '';

    if (type === 'LINKEDIN') {
      const recipientInfo = `${recipientName || 'Hiring Manager'} at ${company || 'Tech Startup'}`;
      const userProfile = `Full Stack Engineer experienced in ${techStack || 'React, Node.js, TypeScript'}`;
      prompt = PROMPTS.linkedInOutreach(recipientInfo, userProfile);
    } else {
      const jobDesc = `${position || 'Software Engineer'} position at ${company || 'Target Company'}. ${jobDescription || ''}`;
      const userProfile = `Senior Developer specializing in web applications & cloud services.`;
      prompt = PROMPTS.coverLetter(jobDesc, userProfile);
    }

    const res = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });

    return NextResponse.json({ result: res.content });
  } catch (error) {
    console.error('[Outreach POST]', error);
    return NextResponse.json({ error: 'Failed to generate outreach' }, { status: 500 });
  }
}
