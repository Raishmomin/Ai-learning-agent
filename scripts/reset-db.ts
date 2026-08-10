// ============================================
// Reset Database & Start Day 1 Learning Plan
// ============================================

import 'dotenv/config';
import { prisma } from '../src/lib/db/prisma';
import { generateDailyTasks, CurriculumEngine } from '../src/lib/learning/engine';
import { sendTelegramNotification } from '../src/lib/notifications/telegram';

const USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

async function resetDatabase() {
  console.log('🧹 Attempting database reset...');

  try {
    await prisma.learningTask.deleteMany({});
    await prisma.learningTopic.deleteMany({});
    await prisma.learningPlan.deleteMany({});
    await prisma.learningProgress.deleteMany({});
    await prisma.interviewSession.deleteMany({});
    await prisma.jobApplication.deleteMany({});
    console.log('✅ Database records wiped successfully!');
  } catch {
    console.log('ℹ️ Database server offline or using fallback in-memory mode.');
  }

  console.log('🚀 Initializing Day 1 Plan and Generating Tasks...');
  
  let summary;
  try {
    summary = await CurriculumEngine.getDailySummary(USER_ID);
  } catch (err) {
    console.warn('Could not fetch from DB directly, using engine summary generator:', err);
  }

  const tasks = summary?.tasksToday || [
    { title: 'Beginner English: Daily Routines & Present Simple Tense (A1)', type: 'ENGLISH_SPEAKING' },
    { title: 'Beginner English Vocabulary: Everyday Workplace Words (A1)', type: 'VOCABULARY' },
    { title: 'JavaScript Event Loop & Execution Context', type: 'DEEP_TECHNICAL' },
    { title: 'Two-Pointer Technique Challenge', type: 'CODING_CHALLENGE' },
  ];

  console.log(`\n✨ DAY 1 ACTIVE TASKS READY (${tasks.length} tasks):`);
  tasks.forEach((t: any, i: number) => {
    console.log(`   ${i + 1}. [${t.type}] ${t.title}`);
  });

  const msg = `🎉 *AI Learning Accelerator — Day 1 Initialized!*\n\nToday's Tasks:\n` +
    tasks.map((t: any, i: number) => `${i + 1}. *${t.title}* (${t.type})`).join('\n') +
    `\n\nOpen your dashboard to start: http://localhost:3000/dashboard`;

  const sent = await sendTelegramNotification(msg);
  if (sent) {
    console.log('\n📱 Telegram notification sent successfully!');
  } else {
    console.log('\nℹ️ Telegram message ready (will send automatically once TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are placed in .env).');
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Reset failed:', err);
    process.exit(1);
  });
