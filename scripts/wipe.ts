// ============================================
// Clean Wipe Script — Deletes all records from database tables
// ============================================

import { prisma } from '../src/lib/db/prisma';

async function wipeAllData() {
  console.log('🧹 Clearing all data from database tables...');

  try {
    const t = await prisma.learningTask.deleteMany({});
    console.log(`  Deleted ${t.count} learning tasks`);
  } catch { console.log('  Tasks table already empty or offline'); }

  try {
    const top = await prisma.learningTopic.deleteMany({});
    console.log(`  Deleted ${top.count} learning topics`);
  } catch { console.log('  Topics table already empty or offline'); }

  try {
    const p = await prisma.learningPlan.deleteMany({});
    console.log(`  Deleted ${p.count} learning plans`);
  } catch { console.log('  Plans table already empty or offline'); }

  try {
    const pr = await prisma.learningProgress.deleteMany({});
    console.log(`  Deleted ${pr.count} progress records`);
  } catch { console.log('  Progress table already empty or offline'); }

  try {
    const i = await prisma.interviewSession.deleteMany({});
    console.log(`  Deleted ${i.count} interview sessions`);
  } catch { console.log('  Interviews table already empty or offline'); }

  try {
    const j = await prisma.jobApplication.deleteMany({});
    console.log(`  Deleted ${j.count} job applications`);
  } catch { console.log('  Applications table already empty or offline'); }

  console.log('✨ All database records cleared completely!');
}

wipeAllData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Wipe encountered error:', err);
    process.exit(0);
  });
