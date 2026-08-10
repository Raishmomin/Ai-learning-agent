import { prisma } from '../src/lib/db/prisma';
import { getDailySummary } from '../src/lib/learning/engine';

async function seed() {
  console.log('Clearing existing database entries...');
  await prisma.learningTask.deleteMany({});
  await prisma.learningTopic.deleteMany({});
  await prisma.learningPlan.deleteMany({});
  await prisma.learningProgress.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Generating fresh 6-month learning plan and today\'s tasks...');
  const summary = await getDailySummary('default-user');

  console.log('====================================================');
  console.log('Greeting:', summary.greeting);
  console.log('Date:', summary.date);
  console.log('Tasks generated for today:', summary.tasksToday.length);
  summary.tasksToday.forEach((t, i) => {
    console.log(`  ${i + 1}. [${t.type}] ${t.title} (${t.difficulty}) — Est: ${t.estimatedMinutes}m`);
  });
  console.log('====================================================');

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
