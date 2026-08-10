// ============================================
// API: Mock Interview — POST (streaming chat)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { LLMGateway } from '@/lib/ai/llm-gateway';
import { PROMPTS } from '@/lib/ai/prompts';
import type { LLMMessage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { messages, type, topic, difficulty } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    // Build system prompt based on interview type
    let systemPrompt: string;
    switch (type) {
      case 'SYSTEM_DESIGN':
        systemPrompt = PROMPTS.systemDesignInterviewer(topic || 'URL Shortener', difficulty || 'MEDIUM');
        break;
      case 'BEHAVIOURAL':
        systemPrompt = PROMPTS.behaviouralInterviewer('European Tech Leader', topic || 'Conflict Resolution');
        break;
      case 'DSA':
        systemPrompt = `You are a coding interviewer. Ask one ${difficulty || 'medium'}-level algorithm question about ${topic || 'arrays and strings'}. Wait for the candidate's solution, then evaluate it. Give hints if they're stuck. Be encouraging but thorough.`;
        break;
      default:
        systemPrompt = PROMPTS.behaviouralInterviewer('European Tech Leader', topic || 'Senior Engineering');
    }

    const llmMessages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Stream the response
    const stream = await LLMGateway.stream(llmMessages, { temperature: 0.7, maxTokens: 2048 });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Interview POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interview failed' },
      { status: 500 }
    );
  }
}
