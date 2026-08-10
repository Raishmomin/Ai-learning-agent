// ============================================
// API: Telegram Webhook & Interactive Operating System
// Full Telegram task interaction: request tasks (task 1..10), answer via chat, auto-complete in DB!
// Supports full uncapped reading material & multi-chunk Telegram message delivery.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { CurriculumEngine, evaluateAnswer } from '@/lib/learning/engine';
import { LLMGateway } from '@/lib/ai/llm-gateway';
import { PROMPTS } from '@/lib/ai/prompts';
import { prisma } from '@/lib/db/prisma';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// In-memory active task tracker per chat: chatId -> taskId
export const activeTaskMap = new Map<number | string, { taskId: string; taskNum: number; title: string }>();

/**
 * Send HTML formatted message to Telegram with auto-chunking for long text (>4000 chars)
 */
export async function sendTelegramMessage(chatId: number | string, text: string) {
  if (!TELEGRAM_TOKEN) return;

  const MAX_CHUNK = 3800;

  // Split into chunks if text exceeds Telegram limit
  if (text.length > MAX_CHUNK) {
    const paragraphs = text.split('\n\n');
    let currentChunk = '';

    for (const para of paragraphs) {
      if ((currentChunk + '\n\n' + para).length > MAX_CHUNK) {
        if (currentChunk.trim()) {
          await sendSingleTelegramMessage(chatId, currentChunk);
          currentChunk = '';
        }
        if (para.length > MAX_CHUNK) {
          for (let i = 0; i < para.length; i += MAX_CHUNK) {
            await sendSingleTelegramMessage(chatId, para.substring(i, i + MAX_CHUNK));
          }
        } else {
          currentChunk = para;
        }
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
      }
    }
    if (currentChunk.trim()) {
      await sendSingleTelegramMessage(chatId, currentChunk);
    }
  } else {
    await sendSingleTelegramMessage(chatId, text);
  }
}

async function sendSingleTelegramMessage(chatId: number | string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      // Fall back to plain text if HTML parsing has illegal tags
      const plainText = text.replace(/<[^>]*>/g, '');
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: plainText, disable_web_page_preview: true }),
      });
    }
  } catch (err) {
    console.error('[Telegram send error]', err);
  }
}

/**
 * Helper to escape HTML special characters safely
 */
function escapeHTML(str: any = ''): string {
  if (typeof str !== 'string') {
    if (typeof str === 'object' && str !== null) return escapeHTML(JSON.stringify(str, null, 2));
    return String(str || '');
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Extract markdown content and reflection questions from task content objects,
 * including nested JSON strings inside rawContent.
 */
function getTaskMarkdownAndQuestions(content: any) {
  let overview = content?.overview || '';
  let markdown = content?.markdown || content?.contentMarkdown || '';
  let reflectionQuestions = content?.reflectionQuestions || content?.questions || [];

  const raw = content?.rawContent || content?.overview || '';
  if (typeof raw === 'string' && raw.includes('{')) {
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.overview) overview = parsed.overview;
      if (parsed.contentMarkdown) markdown = parsed.contentMarkdown;
      if (parsed.markdown) markdown = parsed.markdown;
      if (parsed.reflectionQuestions && parsed.reflectionQuestions.length > 0) reflectionQuestions = parsed.reflectionQuestions;
    } catch {}
  }
  return { overview, markdown, reflectionQuestions };
}

/**
 * Format complete task message for any of the 10 task types (NO SUBSTRING TRUNCATION)
 */
function formatFullTaskMessage(t: any, taskNum: number, totalTasks: number): string {
  const content: any = t.content || {};
  let msg = `<b>📌 TASK ${taskNum} OF ${totalTasks}: ${escapeHTML(t.title)}</b>\n`;
  msg += `<b>Category:</b> ${escapeHTML(t.category || t.type)} | <b>Est. Time:</b> ${t.estimatedMinutes || 30} mins\n`;
  msg += `========================================\n\n`;

  // Type 1: Vocabulary & Grammar Drills
  if (t.type === 'VOCABULARY' || content.words) {
    if (content.words && Array.isArray(content.words)) {
      msg += `📖 <b>Today's Vocabulary Words:</b>\n\n`;
      content.words.forEach((w: any, idx: number) => {
        msg += `${idx + 1}. <b>${escapeHTML(w.word)}</b>: ${escapeHTML(w.meaning || w.definition || '')}\n`;
        if (w.example) msg += `   <i>Example: "${escapeHTML(w.example)}"</i>\n`;
      });
      msg += `\n`;
    }
    if (content.usagePrompt) {
      msg += `✍️ <b>Practice Exercise:</b>\n${escapeHTML(content.usagePrompt)}\n\n`;
    }
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nWrite 2-3 sentences using these words and reply directly here to evaluate & complete!`;
  }

  // Type 2: IELTS & English Speaking
  else if (t.type === 'IELTS_SPEAKING' || t.type === 'ENGLISH_SPEAKING' || content.cueCard) {
    const cue = content.cueCard || {};
    msg += `🗣️ <b>IELTS Speaking Cue Card:</b>\n`;
    msg += `<b>Topic:</b> ${escapeHTML(cue.topic || t.title)}\n\n`;
    if (cue.bulletPoints && Array.isArray(cue.bulletPoints)) {
      msg += `<b>Points to cover:</b>\n`;
      cue.bulletPoints.forEach((b: string) => { msg += `• ${escapeHTML(b)}\n`; });
      msg += `\n`;
    }
    if (content.questions && Array.isArray(content.questions)) {
      msg += `<b>Follow-up Questions:</b>\n`;
      content.questions.forEach((q: any) => { msg += `• ${escapeHTML(typeof q === 'string' ? q : q.question)}\n`; });
      msg += `\n`;
    }
    if (content.vocabulary && Array.isArray(content.vocabulary)) {
      msg += `✨ <b>Band 8.5+ Words to use:</b> ${escapeHTML(content.vocabulary.join(', '))}\n\n`;
    }
    if (content.advice) {
      msg += `💡 <b>Examiner Advice:</b> <i>${escapeHTML(content.advice)}</i>\n\n`;
    }
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nReply to this message with your spoken transcript to auto-complete!`;
  }

  // Type 3: Deep Technical Masterclasses
  else if (t.type === 'DEEP_TECHNICAL') {
    const extracted = getTaskMarkdownAndQuestions(content);
    if (extracted.overview) {
      msg += `🧠 <b>Masterclass Executive Overview:</b>\n${escapeHTML(extracted.overview)}\n\n`;
    }
    
    if (extracted.markdown) {
      msg += `📚 <b>Technical Breakdown & Study Material:</b>\n${escapeHTML(extracted.markdown)}\n\n`;
    }

    if (extracted.reflectionQuestions && extracted.reflectionQuestions.length > 0) {
      msg += `❓ <b>Senior Reflection Questions:</b>\n`;
      extracted.reflectionQuestions.forEach((q: any, idx: number) => {
        msg += `${idx + 1}. ${escapeHTML(typeof q === 'string' ? q : q.question || q.prompt)}\n`;
      });
      msg += `\n`;
    }
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nReply with your technical explanation to get evaluated & complete on site!`;
  }

  // Type 4: Case Studies
  else if (t.type === 'CASE_STUDY') {
    msg += `🏗️ <b>Industrial Case Study — ${escapeHTML(content.company || 'Booking.com')}:</b>\n\n`;
    if (content.scale) msg += `📊 <b>Scale Context:</b> ${escapeHTML(content.scale)}\n\n`;
    msg += `🎯 <b>Problem Statement:</b>\n${escapeHTML(content.problem || content.overview || t.title)}\n\n`;
    if (content.architecture) {
      msg += `⚙️ <b>Architecture Overview:</b>\n${escapeHTML(content.architecture)}\n\n`;
    }
    if (content.tradeoffs) {
      msg += `⚖️ <b>Key Tradeoffs Made:</b>\n${escapeHTML(content.tradeoffs)}\n\n`;
    }
    if (content.questions && Array.isArray(content.questions)) {
      msg += `❓ <b>Architecture Critique Questions:</b>\n`;
      content.questions.forEach((q: any, idx: number) => {
        msg += `${idx + 1}. ${escapeHTML(typeof q === 'string' ? q : q.question)}\n`;
      });
      msg += `\n`;
    }
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nReply with your system critique to grade & complete!`;
  }

  // Type 5: Engineering & Coding Challenges
  else if (t.type === 'ENGINEERING_CHALLENGE' || t.type === 'CODING_CHALLENGE') {
    msg += `💻 <b>Engineering Problem Statement:</b>\n`;
    msg += `${escapeHTML(content.description || content.overview || t.title)}\n\n`;
    if (content.requirements && Array.isArray(content.requirements)) {
      msg += `📋 <b>Requirements:</b>\n`;
      content.requirements.forEach((r: string) => { msg += `• ${escapeHTML(r)}\n`; });
      msg += `\n`;
    }
    if (content.starterCode) {
      msg += `💻 <b>Starter Code:</b>\n<pre>${escapeHTML(content.starterCode)}</pre>\n\n`;
    }
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nPaste your code solution here as a reply to test & auto-complete!`;
  }

  // Type 6: Production Incidents
  else if (t.type === 'PRODUCTION_INCIDENT') {
    msg += `🚨 <b>P0 Production Outage Lab:</b>\n\n`;
    msg += `<b>Scenario:</b> ${escapeHTML(content.scenario || content.description || t.title)}\n\n`;
    if (content.symptoms) {
      msg += `📈 <b>Failure Symptoms & Metrics:</b>\n${escapeHTML(content.symptoms)}\n\n`;
    }
    if (content.logs) {
      msg += `📟 <b>System Logs:</b>\n<pre>${escapeHTML(content.logs)}</pre>\n\n`;
    }
    msg += `❓ <b>SRE Root Cause Question:</b>\nWhat is the primary root cause and what 3 immediate remediation steps will you execute to restore availability?\n\n`;
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nSend your incident postmortem steps to resolve & auto-complete!`;
  }

  // Type 7: Code Review
  else if (t.type === 'CODE_REVIEW') {
    msg += `🔍 <b>Pull Request Security & Performance Review:</b>\n\n`;
    if (content.pullRequestTitle) msg += `<b>PR Title:</b> ${escapeHTML(content.pullRequestTitle)}\n\n`;
    if (content.diff || content.codeSnippet) {
      msg += `📄 <b>Code Diff to Review:</b>\n<pre>${escapeHTML(content.diff || content.codeSnippet)}</pre>\n\n`;
    }
    msg += `❓ <b>Review Prompt:</b>\nIdentify security vulnerabilities, memory leaks, or performance flaws in this PR and propose fixes.\n\n`;
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nSend your PR review comments here to grade & auto-complete!`;
  }

  // Type 8: System Design QA
  else if (t.type === 'SYSTEM_DESIGN_QA') {
    msg += `🏛️ <b>System Design Architecture Lab:</b>\n\n`;
    msg += `<b>Topic:</b> ${escapeHTML(t.title)}\n\n`;
    if (content.scaleRequirement) msg += `📊 <b>Scale Requirements:</b> ${escapeHTML(content.scaleRequirement)}\n\n`;
    if (content.description || content.overview) msg += `📝 <b>Overview:</b> ${escapeHTML(content.description || content.overview)}\n\n`;
    msg += `❓ <b>System Design Questions:</b>\n1. Design the data storage layer and caching strategy.\n2. How will you handle data partitioning and failover under 100k QPS?\n\n`;
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nReply with your high-level architecture answer to evaluate & complete!`;
  }

  // Type 9: AI Engineering
  else if (t.type === 'AI_ENGINEERING') {
    msg += `🤖 <b>AI Engineering & Vector Pipeline Lab:</b>\n\n`;
    if (content.concept) msg += `🧠 <b>Concept:</b> ${escapeHTML(content.concept)}\n\n`;
    if (content.exercise) msg += `🎯 <b>Hands-on Exercise:</b> ${escapeHTML(content.exercise)}\n\n`;
    if (content.starterCode) {
      msg += `💻 <b>Starter Code:</b>\n<pre>${escapeHTML(content.starterCode)}</pre>\n\n`;
    }
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nPaste your RAG/Vector solution code to grade & complete!`;
  }

  // Type 10: DevOps Lab
  else if (t.type === 'DEVOPS_LAB') {
    msg += `🐧 <b>DevOps & Cloud Infrastructure Lab:</b>\n\n`;
    if (content.scenario) msg += `☁️ <b>Scenario:</b> ${escapeHTML(content.scenario)}\n\n`;
    if (content.requirements) msg += `📋 <b>Requirements:</b> ${escapeHTML(content.requirements)}\n\n`;
    if (content.starterConfig) {
      msg += `📄 <b>Configuration:</b>\n<pre>${escapeHTML(content.starterConfig)}</pre>\n\n`;
    }
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nSend your DevOps config/commands to evaluate & complete!`;
  }

  // Fallback
  else {
    msg += `📝 <b>Task Description:</b>\n${escapeHTML(content.description || content.overview || t.title)}\n\n`;
    msg += `💬 <b>HOW TO SUBMIT ANSWER:</b>\nType your solution here on Telegram to evaluate & complete!`;
  }

  msg += `\n\n🌐 <i>Or practice on Dashboard: http://localhost:3000/dashboard/practice?taskId=${t.id}</i>`;
  return msg;
}

/**
 * Main Message Router for Telegram
 */
export async function handleTelegramMessage(chatId: number | string, text: string) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Match "task 1", "task 2", ..., "task 10", "/task 2"
  const taskMatch = lower.match(/^(?:\/)?task\s*(\d+)$/);

  if (taskMatch) {
    const taskNum = parseInt(taskMatch[1], 10);
    const summary = await CurriculumEngine.getDailySummary();
    const tasks = summary.tasksToday || [];

    if (taskNum < 1 || taskNum > tasks.length) {
      await sendTelegramMessage(
        chatId,
        `<b>⚠️ Invalid task number!</b> Today has ${tasks.length} active tasks.\n\nType <b>today</b> or <b>task 1</b> to <b>task ${tasks.length}</b>.`
      );
      return;
    }

    const t = tasks[taskNum - 1];
    
    // Save this task as active for this chat
    activeTaskMap.set(chatId, { taskId: t.id, taskNum, title: t.title });

    // Build complete formatted message with ALL questions & study material
    const fullMsg = formatFullTaskMessage(t, taskNum, tasks.length);

    await sendTelegramMessage(chatId, fullMsg);
    return;
  }

  // Commands: /start, /help, hi, hello
  if (lower === '/start' || lower === '/help' || lower === 'hi' || lower === 'hello') {
    const welcomeMsg = `🚀 <b>AI Career & IELTS Accelerator Agent</b>\n\n<b>Commands:</b>\n• <b>task 1</b>, <b>task 2</b>, ..., <b>task 10</b> — Request full task details & questions\n• <b>today</b> — View today's 10 active tasks\n• <b>progress</b> — Check your streak & completion rate\n\n💡 <b>Telegram Interactive Mode:</b>\nWhen you request a task (e.g. <b>task 3</b>) and reply with your answer here, the AI will grade it AND <b>automatically mark it COMPLETED in your dashboard database</b>!`;
    await sendTelegramMessage(chatId, welcomeMsg);
    return;
  }

  // Command: today / tasks
  if (lower === '/today' || lower === 'today' || lower === 'tasks') {
    const summary = await CurriculumEngine.getDailySummary();
    let reply = `📅 <b>Today's 10 Active Tasks</b>\n🔥 Streak: <b>${summary.streak} days</b>\n\n`;
    summary.tasksToday.forEach((t, i) => {
      const statusIcon = t.status === 'COMPLETED' ? '✅' : '📌';
      reply += `${statusIcon} <b>Task ${i + 1}</b>: [${escapeHTML(t.type)}] <b>${escapeHTML(t.title)}</b>\n`;
    });
    reply += `\n👉 Type <b>task 1</b>, <b>task 2</b>, etc. to load full task details!`;
    await sendTelegramMessage(chatId, reply);
    return;
  }

  // Command: progress
  if (lower === '/progress' || lower === 'progress') {
    const summary = await CurriculumEngine.getDailySummary();
    const reply = `📊 <b>Your Progress Metrics</b>\n\n🔥 Streak: <b>${summary.streak} days</b>\n📈 Weekly Progress: <b>${summary.weeklyProgress}%</b>\n🧠 Reviews Due: <b>${summary.reviewsDue}</b>\n\n💪 <i>${escapeHTML(summary.motivationalQuote)}</i>`;
    await sendTelegramMessage(chatId, reply);
    return;
  }

  // User submitted an answer to active task!
  const activeSession = activeTaskMap.get(chatId);
  if (activeSession) {
    await sendTelegramMessage(chatId, `⏳ <i>AI is evaluating your answer for Task ${activeSession.taskNum} ("${escapeHTML(activeSession.title)}")...</i>`);

    try {
      // Evaluate answer and auto-complete task in DB
      const result = await evaluateAnswer(activeSession.taskId, trimmed);

      let evalMsg = `🎉 <b>TASK ${activeSession.taskNum} COMPLETED & SAVED TO DASHBOARD!</b>\n\n`;
      evalMsg += `🏆 <b>Score:</b> ${result.score} / 100\n\n`;
      evalMsg += `💬 <b>Feedback:</b>\n${escapeHTML(result.feedback)}\n\n`;

      if (result.strengths && result.strengths.length > 0) {
        evalMsg += `🌟 <b>Key Strengths:</b>\n`;
        result.strengths.forEach((s: string) => { evalMsg += `• ${escapeHTML(s)}\n`; });
        evalMsg += `\n`;
      }

      if (result.improvements && result.improvements.length > 0) {
        evalMsg += `🎯 <b>Areas for Improvement:</b>\n`;
        result.improvements.forEach((imp: string) => { evalMsg += `• ${escapeHTML(imp)}\n`; });
        evalMsg += `\n`;
      }

      const nextNum = activeSession.taskNum + 1;
      if (nextNum <= 10) {
        evalMsg += `➡️ <b>Next Step:</b> Type <b>task ${nextNum}</b> to load Task ${nextNum}!`;
      } else {
        evalMsg += `🏆 <b>All 10 tasks completed for today! Great job!</b>`;
      }

      // Clear active task session
      activeTaskMap.delete(chatId);

      await sendTelegramMessage(chatId, evalMsg);
      return;
    } catch (err) {
      console.error('[Telegram evaluate answer error]', err);
    }
  }

  // General AI Coach Response if no active task
  const coachPrompt = `You are a supportive tech & English coach. The user sent: "${trimmed}". Respond helpfully in under 100 words. Remind them they can type "task 1" or "today" to view tasks.`;
  const res = await LLMGateway.chat([{ role: 'user', content: coachPrompt }]);
  await sendTelegramMessage(chatId, res.content);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    await handleTelegramMessage(message.chat.id, message.text);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook Error]', error);
    return NextResponse.json({ ok: true });
  }
}
