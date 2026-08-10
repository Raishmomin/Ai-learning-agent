// ============================================
// Learning Engine — Task Generation & Evaluation
// Handles 11 Daily Modules, Timers, IELTS Rotation, Code Evaluation
// ============================================

import { prisma } from '@/lib/db/prisma';
import { LLMGateway } from '@/lib/ai/llm-gateway';
import { PROMPTS } from '@/lib/ai/prompts';
import { calculateNextReview, scoreToQuality } from './spaced-repetition';
import { getWeekCurriculum, getCurrentWeek, getIELTSFocusForDay } from './curriculum';
import type { DailySummary, EvaluationResult, LLMMessage } from '@/types';

export const CurriculumEngine = {
  generateDailyTasks,
  evaluateAnswer,
  getDailySummary: (userId?: string) => getDailySummary(userId || process.env.DEFAULT_USER_ID || 'default-user'),
};

/**
 * Allocated time in seconds by task type
 */
function getAllocatedSec(taskType: string): number {
  const map: Record<string, number> = {
    DEEP_TECHNICAL: 5400,         // 90 min
    SYSTEM_DESIGN_QA: 3600,       // 60 min
    ENGINEERING_CHALLENGE: 2700,   // 45 min
    IELTS_WRITING: 2400,          // 40 min
    IELTS_READING: 1800,          // 30 min
    CASE_STUDY: 1800,             // 30 min
    PRODUCTION_INCIDENT: 1800,    // 30 min
    AI_ENGINEERING: 1800,         // 30 min
    DEVOPS_LAB: 1800,             // 30 min
    IELTS_SPEAKING: 1200,         // 20 min
    CODE_REVIEW: 1200,            // 20 min
    ENGLISH_SPEAKING: 1200,       // 20 min
    VOCABULARY: 900,              // 15 min
    GRAMMAR: 900,                 // 15 min
    IELTS_LISTENING: 1500,        // 25 min
    CODING_CHALLENGE: 2700,       // 45 min
    QUIZ: 900,                    // 15 min
    FLASHCARD: 600,               // 10 min
  };
  return map[taskType] || 1800;
}

/**
 * Generate today's 11 daily task modules for a user
 */
export async function generateDailyTasks(userId: string) {
  const plan = await prisma.learningPlan.findUnique({
    where: { userId },
    include: { topics: true, tasks: true },
  });

  if (!plan) throw new Error('No learning plan found. Please create one first.');

  const currentWeek = getCurrentWeek(plan.startDate);
  const weekCurriculum = getWeekCurriculum(currentWeek);
  if (!weekCurriculum) throw new Error(`No curriculum for week ${currentWeek}`);

  const today = new Date().toISOString().split('T')[0];

  // 1. Check if tasks already generated today
  const existingToday = await prisma.learningTask.findMany({
    where: {
      planId: plan.id,
      dueDate: { gte: new Date(today), lt: new Date(today + 'T23:59:59Z') },
    },
    include: { topic: true },
    orderBy: { dueDate: 'asc' },
  });

  if (existingToday.length >= 5) {
    return existingToday;
  }

  // 2. Get spaced repetition reviews due
  const reviewsDue = await prisma.learningTask.findMany({
    where: {
      planId: plan.id,
      nextReviewDate: { lte: new Date() },
      status: { in: ['COMPLETED', 'REVIEW_DUE'] },
    },
    take: 3,
  });

  for (const task of reviewsDue) {
    await prisma.learningTask.update({
      where: { id: task.id },
      data: { status: 'REVIEW_DUE' },
    });
  }

  // 3. Ensure a primary topic exists for this week
  const primaryTopicData = weekCurriculum.topics[0];
  let dbTopic = await prisma.learningTopic.findFirst({
    where: { planId: plan.id, title: primaryTopicData.title, weekNumber: currentWeek },
  });

  if (!dbTopic) {
    dbTopic = await prisma.learningTopic.create({
      data: {
        planId: plan.id,
        title: primaryTopicData.title,
        description: primaryTopicData.description,
        category: primaryTopicData.category as never,
        weekNumber: currentWeek,
      },
    });
  }

  // 4. Generate the 11 modules if dailyModules present, or fall back to template
  const dayOfWeek = new Date().getDay(); // 0-6
  const ieltsRotation = getIELTSFocusForDay(dayOfWeek);
  const newTasks = [];

  const modulesToBuild = weekCurriculum.dailyModules || {
    vocabulary: { topic: `${primaryTopicData.title} Vocabulary`, description: '10 technical & IELTS words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
    english: { topic: `IELTS ${ieltsRotation.skill} & Speaking Practice`, description: `Practice ${ieltsRotation.skill} for Band 8.5+`, difficulty: 'MEDIUM', durationMinutes: ieltsRotation.durationMinutes, taskType: ieltsRotation.taskType, category: 'ENGLISH' },
    deepTechnical: { topic: primaryTopicData.title, description: primaryTopicData.description, difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: primaryTopicData.category },
    caseStudy: { topic: `${primaryTopicData.title} Architecture at Booking.com/Adyen`, description: 'High-scale industrial case study', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
    engineeringChallenge: { topic: `Build ${primaryTopicData.title} Production Component`, description: 'Practical coding challenge with test cases', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: primaryTopicData.category },
    productionIncident: { topic: `P0 Outage: ${primaryTopicData.title} Failure`, description: 'Interactive SRE debugging lab', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'MONITORING' },
    codeReview: { topic: `Code Review: ${primaryTopicData.title} Pull Request`, description: 'Find security and performance flaws', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: primaryTopicData.category },
    systemDesign: { topic: `System Design: ${primaryTopicData.title} at Scale`, description: 'High-level & low-level design', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
    aiEngineering: { topic: 'RAG & Agent Pipeline Practice', description: 'Hands-on AI engineering module', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
    devops: { topic: 'Docker & Kubernetes Cloud Deployment Lab', description: 'Infrastructure configuration', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' },
  };

  for (const [key, mod] of Object.entries(modulesToBuild)) {
    try {
      const task = await generateSingleTask(plan.id, dbTopic.id, mod, currentWeek);
      if (task) newTasks.push(task);
    } catch (err) {
      console.error(`Failed to generate module ${key}:`, err);
    }
  }

  return [...reviewsDue, ...newTasks];
}

/**
 * Generate a single task using LLM
 */
async function generateSingleTask(
  planId: string,
  topicId: string,
  mod: { topic: string; description: string; difficulty: string; taskType: string; category: string },
  weekNumber: number
) {
  let prompt: string;
  let content: Record<string, unknown> = {};
  let solution: Record<string, unknown> = {};
  let title = mod.topic;

  try {
    switch (mod.taskType) {
      case 'VOCABULARY': {
        prompt = PROMPTS.generateVocabulary(mod.category, weekNumber);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = `Daily 10 Vocabulary Words & Grammar Drill`;
        content = { words: parsed.words || [], usagePrompt: parsed.usageExercisePrompt };
        solution = { keyTakeaways: parsed.words?.map((w: { word: string }) => w.word) };
        break;
      }

      case 'GRAMMAR': {
        prompt = PROMPTS.generateGrammarLesson(mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = `Grammar Drill: ${mod.topic}`;
        content = { explanation: parsed.explanation, rules: parsed.band8UpgradeRules, mistakes: parsed.commonMistakes, drills: parsed.drills };
        solution = { answers: parsed.drills?.map((d: { answer: string }) => d.answer) };
        break;
      }

      case 'IELTS_SPEAKING':
      case 'ENGLISH_SPEAKING': {
        prompt = PROMPTS.generateIELTSSpeaking(2, mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = `IELTS 8.5+ Speaking: ${mod.topic}`;
        content = { cueCard: parsed.cueCard, questions: parsed.questions, vocabulary: parsed.band85Vocabulary, advice: parsed.examinerAdvice };
        solution = { targetBand: 8.5 };
        break;
      }

      case 'IELTS_WRITING': {
        prompt = PROMPTS.generateIELTSWriting('Task 2', mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = `IELTS Writing Task 2: ${mod.topic}`;
        content = { prompt: parsed.prompt, wordCount: parsed.wordCountRequirement, minutes: parsed.recommendedMinutes, structure: parsed.band85Structure };
        solution = { vocabulary: parsed.modelVocabulary };
        break;
      }

      case 'IELTS_READING': {
        prompt = PROMPTS.generateIELTSReading(mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = `IELTS Academic Reading: ${parsed.title || mod.topic}`;
        content = { passage: parsed.passage, questions: parsed.questions };
        solution = { answers: parsed.questions?.map((q: { id: number; correctAnswer: string }) => ({ id: q.id, answer: q.correctAnswer })) };
        break;
      }

      case 'IELTS_LISTENING': {
        prompt = PROMPTS.generateIELTSListening(mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = `IELTS Listening Section: ${mod.topic}`;
        content = { transcript: parsed.audioTranscript, questions: parsed.questions };
        solution = { answers: parsed.questions?.map((q: { id: number; correctAnswer: string }) => ({ id: q.id, answer: q.correctAnswer })) };
        break;
      }

      case 'DEEP_TECHNICAL': {
        prompt = PROMPTS.generateDeepTechnical(mod.topic, weekNumber);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = parsed.title || `Deep Technical: ${mod.topic}`;
        const markdown = parsed.contentMarkdown || parsed.markdown || parsed.body || (typeof response.content === 'string' && !response.content.trim().startsWith('{') ? response.content : undefined);
        content = {
          overview: parsed.overview,
          markdown,
          reflectionQuestions: parsed.reflectionQuestions || parsed.questions || [],
          rawContent: response.content
        };
        solution = { takeaways: parsed.keyTakeaways };
        break;
      }

      case 'CASE_STUDY': {
        prompt = PROMPTS.generateCaseStudy('Booking.com', mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = parsed.title || `Case Study: ${mod.topic}`;
        content = { company: parsed.company, scale: parsed.scaleContext, problem: parsed.theProblem, architecture: parsed.theArchitecture, tradeoffs: parsed.tradeoffsMade, questions: parsed.questions };
        solution = { keyLessons: parsed.keyLessons };
        break;
      }

      case 'ENGINEERING_CHALLENGE':
      case 'CODING_CHALLENGE': {
        prompt = PROMPTS.generateEngineeringChallenge(mod.topic, mod.difficulty);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = parsed.title || `Engineering Challenge: ${mod.topic}`;
        content = {
          description: parsed.description,
          requirements: parsed.requirements,
          starterCode: parsed.starterCode || '// Write your JS solution here\nfunction solution(input) {\n  return input;\n}',
          testCases: parsed.testCases || [
            { input: '[2, 7, 11, 15], 9', expected: '[0,1]', description: 'Basic case' }
          ],
          hints: parsed.hints
        };
        solution = { code: parsed.modelSolution || parsed.starterCode };
        break;
      }

      case 'PRODUCTION_INCIDENT': {
        prompt = PROMPTS.generateProductionIncident(mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = parsed.title || `P0 Incident: ${mod.topic}`;
        content = { metrics: parsed.metricsDashboard, logs: parsed.logsSnippet, description: parsed.incidentDescription, srePrompts: parsed.srePrompts };
        solution = { rootCause: parsed.rootCause };
        break;
      }

      case 'CODE_REVIEW': {
        prompt = PROMPTS.generateCodeReview(mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = parsed.title || `Code Review: ${mod.topic}`;
        content = { snippet: parsed.codeSnippet, instructions: parsed.instructions, flaws: parsed.flaws };
        solution = { refactoredCode: parsed.idealRefactoredCode };
        break;
      }

      case 'AI_ENGINEERING': {
        prompt = PROMPTS.generateAIEngineering(mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = parsed.title || `AI Engineering: ${mod.topic}`;
        content = { concept: parsed.conceptExplanation, exercise: parsed.codeExercise, starterCode: parsed.starterCode, testCases: parsed.testCases };
        solution = { solutionCode: parsed.solution };
        break;
      }

      case 'DEVOPS_LAB': {
        prompt = PROMPTS.generateDevOpsLab(mod.topic);
        const response = await LLMGateway.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
        const parsed = parseJSONSafe(response.content);
        title = parsed.title || `DevOps Lab: ${mod.topic}`;
        content = { scenario: parsed.scenario, requirements: parsed.requirements, starterConfig: parsed.starterConfig, validationCriteria: parsed.validationCriteria };
        solution = { solutionConfig: parsed.solution };
        break;
      }

      default: {
        title = `${mod.topic} — ${mod.taskType.replace(/_/g, ' ')}`;
        content = { description: mod.description };
      }
    }
  } catch (err) {
    console.warn(`[generateSingleTask fallback] using default structure for ${mod.topic}:`, err);
    content = { description: mod.description };
  }

  const allocatedSec = getAllocatedSec(mod.taskType);

  return prisma.learningTask.create({
    data: {
      planId,
      topicId,
      title,
      description: mod.description,
      type: mod.taskType as never,
      content: content as never,
      solution: solution as never,
      difficulty: mod.difficulty.toUpperCase() as never,
      allocatedSec,
      status: 'PENDING',
      dueDate: new Date(),
    },
  });
}

function parseJSONSafe(text: string): Record<string, any> {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: text };
  }
}

/**
 * Evaluate a user's answer to a task
 */
export async function evaluateAnswer(
  taskId: string,
  userAnswer: string,
  timeSpentSec?: number
): Promise<EvaluationResult> {
  const task = await prisma.learningTask.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const content = task.content as Record<string, unknown>;
  const solution = task.solution as Record<string, unknown>;

  let prompt: string;

  switch (task.type) {
    case 'IELTS_SPEAKING':
    case 'ENGLISH_SPEAKING':
      prompt = PROMPTS.evaluateIELTSSpeaking(userAnswer, task.title);
      break;

    case 'IELTS_WRITING':
      prompt = PROMPTS.evaluateIELTSWriting(userAnswer, task.title);
      break;

    case 'ENGINEERING_CHALLENGE':
    case 'CODING_CHALLENGE':
      prompt = PROMPTS.evaluateCode(
        (content.description as string) || task.title,
        userAnswer,
        (solution.code as string) || 'N/A'
      );
      break;

    default:
      prompt = PROMPTS.evaluateTaskAnswer(task.title, task.type, userAnswer, JSON.stringify(solution));
  }

  const messages: LLMMessage[] = [{ role: 'user', content: prompt }];
  const response = await LLMGateway.chat(messages, { temperature: 0.3 });

  let result: EvaluationResult;
  try {
    const parsed = parseJSONSafe(response.content);
    const score = parsed.overallBand ? Math.round((parsed.overallBand / 9) * 100) : (parsed.score ?? 70);

    result = {
      score,
      feedback: parsed.feedback || parsed.detailedFeedback || response.content,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || parsed.weaknesses || [],
      nextSteps: parsed.nextSteps || parsed.actionableTip || '',
      quality: scoreToQuality(score),
      ieltsBand: parsed.overallBand || undefined,
    };
  } catch {
    result = {
      score: 65,
      feedback: response.content,
      strengths: [],
      improvements: [],
      nextSteps: 'Keep practicing daily!',
      quality: 3,
    };
  }

  // Calculate timer overtime
  const allocated = task.allocatedSec || 1800;
  const spent = timeSpentSec || task.timeSpentSec || 600;
  const overtimeSec = Math.max(0, spent - allocated);

  const repetition = calculateNextReview(
    result.quality,
    task.interval,
    task.easeFactor,
    task.repetitionLevel
  );

  await prisma.learningTask.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETED',
      score: result.score,
      feedback: result.feedback,
      userAnswer,
      timeSpentSec: spent,
      overtimeSec,
      completedAt: new Date(),
      repetitionLevel: repetition.repetitionLevel,
      nextReviewDate: repetition.nextReviewDate,
      easeFactor: repetition.easeFactor,
      interval: repetition.interval,
      reviewCount: { increment: 1 },
    },
  });

  await updateDailyProgress(task.planId);

  return result;
}

/**
 * Update daily progress tracking
 */
async function updateDailyProgress(planId: string) {
  const plan = await prisma.learningPlan.findUnique({ where: { id: planId } });
  if (!plan) return;

  const today = new Date().toISOString().split('T')[0];

  const completed = await prisma.learningTask.count({
    where: { planId, completedAt: { gte: new Date(today) } },
  });

  const total = await prisma.learningTask.count({
    where: { planId, dueDate: { gte: new Date(today), lt: new Date(today + 'T23:59:59Z') } },
  });

  const avgScore = await prisma.learningTask.aggregate({
    where: { planId, completedAt: { gte: new Date(today) } },
    _avg: { score: true },
  });

  const streak = completed > 0 ? 1 : 0;

  await prisma.learningProgress.upsert({
    where: { userId_date: { userId: plan.userId, date: today } },
    update: {
      tasksCompleted: completed,
      tasksTotal: total,
      avgScore: avgScore._avg.score,
      streak,
    },
    create: {
      userId: plan.userId,
      date: today,
      tasksCompleted: completed,
      tasksTotal: total,
      avgScore: avgScore._avg.score,
      streak,
    },
  });
}

/**
 * Get daily summary for Dashboard and Telegram
 */
export async function getDailySummary(userId: string): Promise<DailySummary> {
  const today = new Date().toISOString().split('T')[0];

  try {
    let plan = await prisma.learningPlan.findUnique({
      where: { userId },
    });

    if (!plan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, name: 'Raish', email: 'raish@agent.local' },
      });

      plan = await prisma.learningPlan.create({
        data: {
          userId,
          title: '6-Month Career Operating System',
          description: 'Senior Engineer Accelerator targeting NL/EE/DE/IE relocation',
          startDate,
          endDate,
          config: { timezone: 'Asia/Kolkata', dailyHours: 7.5 },
        },
      });

      const week1 = getWeekCurriculum(1);
      if (week1) {
        for (const topic of week1.topics) {
          await prisma.learningTopic.create({
            data: {
              planId: plan.id,
              title: topic.title,
              description: topic.description,
              category: topic.category as never,
              weekNumber: 1,
            },
          });
        }
      }
    }

    let tasks = await prisma.learningTask.findMany({
      where: {
        planId: plan.id,
        OR: [
          { dueDate: { gte: new Date(today), lt: new Date(today + 'T23:59:59Z') } },
          { status: 'REVIEW_DUE' },
          { status: 'PENDING' },
          { status: 'COMPLETED', completedAt: { gte: new Date(today) } }
        ],
      },
      include: { topic: true },
      orderBy: { dueDate: 'asc' },
    });

    if (tasks.length === 0) {
      tasks = await generateDailyTasks(userId) as any;
    }

    const currentWeek = getCurrentWeek(plan.startDate);
    const weekCurriculum = getWeekCurriculum(currentWeek);
    const dayOfWeek = new Date().getDay();
    const ieltsFocus = getIELTSFocusForDay(dayOfWeek);
    const reviewsDue = tasks.filter((t: any) => t.status === 'REVIEW_DUE').length;

    const progress = await prisma.learningProgress.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const weekCompleted = await prisma.learningTask.count({
      where: { planId: plan.id, status: 'COMPLETED', completedAt: { gte: getStartOfWeek() } },
    });

    // Deduplicate and cap at 10 daily tasks
    const uniqueMap = new Map<string, typeof tasks[0]>();
    for (const t of tasks) {
      if (!uniqueMap.has(t.title)) {
        uniqueMap.set(t.title, t);
      }
    }
    const finalTasks = Array.from(uniqueMap.values()).slice(0, 10);

    return {
      date: today,
      greeting: `Good ${getTimeOfDay()}! Week ${currentWeek}/24 — ${weekCurriculum?.theme || 'Career OS Active'}`,
      tasksToday: finalTasks.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        difficulty: t.difficulty,
        category: t.topic?.category || 'GENERAL',
        estimatedMinutes: Math.round((t.allocatedSec || getAllocatedSec(t.type)) / 60),
        allocatedSec: t.allocatedSec || getAllocatedSec(t.type),
        isReview: t.status === 'REVIEW_DUE',
        status: t.status,
        score: t.score || undefined,
        content: t.content as any,
        solution: t.solution as any,
      })),
      reviewsDue,
      streak: progress?.streak ?? 1,
      weeklyProgress: Math.min(100, Math.round((weekCompleted / 11) * 100)),
      motivationalQuote: getMotivationalQuote(),
      honestPerformanceNote: `Focusing on international Senior standards for Netherlands/Estonia/Germany.`,
      ieltsFocusToday: `Today's IELTS Focus: ${ieltsFocus.skill} (${ieltsFocus.durationMinutes} mins)`
    };
  } catch (err) {
    console.error('[getDailySummary fallback]', err);
    return {
      date: today,
      greeting: `Good ${getTimeOfDay()}! Week 1/24 — JS Engine Internals & Memory Model`,
      tasksToday: [
        { id: 't1', title: 'Daily 10 Vocabulary Words & Grammar Drill', type: 'VOCABULARY', difficulty: 'MEDIUM', category: 'VOCABULARY', estimatedMinutes: 15, allocatedSec: 900, isReview: false },
        { id: 't2', title: 'IELTS 8.5+ Speaking Practice', type: 'IELTS_SPEAKING', difficulty: 'MEDIUM', category: 'ENGLISH', estimatedMinutes: 20, allocatedSec: 1200, isReview: false },
        { id: 't3', title: 'JavaScript Event Loop & Microtasks Masterclass', type: 'DEEP_TECHNICAL', difficulty: 'HARD', category: 'JAVASCRIPT', estimatedMinutes: 90, allocatedSec: 5400, isReview: false },
        { id: 't4', title: 'Booking.com 1M Bookings/Day Case Study', type: 'CASE_STUDY', difficulty: 'HARD', category: 'CASE_STUDY', estimatedMinutes: 30, allocatedSec: 1800, isReview: false },
        { id: 't5', title: 'Build JWT Auth System with Refresh Tokens', type: 'ENGINEERING_CHALLENGE', difficulty: 'HARD', category: 'SECURITY', estimatedMinutes: 45, allocatedSec: 2700, isReview: false },
        { id: 't6', title: 'P0 Outage: DB Connection Pool Exhaustion', type: 'PRODUCTION_INCIDENT', difficulty: 'HARD', category: 'DATABASE', estimatedMinutes: 30, allocatedSec: 1800, isReview: false },
        { id: 't7', title: 'Node.js Express Security PR Review', type: 'CODE_REVIEW', difficulty: 'MEDIUM', category: 'NODEJS', estimatedMinutes: 20, allocatedSec: 1200, isReview: false },
        { id: 't8', title: 'System Design: High Throughput URL Shortener', type: 'SYSTEM_DESIGN_QA', difficulty: 'MEDIUM', category: 'SYSTEM_DESIGN', estimatedMinutes: 60, allocatedSec: 3600, isReview: false },
        { id: 't9', title: 'Embeddings & Vector Search Lab', type: 'AI_ENGINEERING', difficulty: 'MEDIUM', category: 'AI_ML', estimatedMinutes: 30, allocatedSec: 1800, isReview: false },
        { id: 't10', title: 'Linux Process Management & Networking Lab', type: 'DEVOPS_LAB', difficulty: 'MEDIUM', category: 'DEVOPS', estimatedMinutes: 30, allocatedSec: 1800, isReview: false },
      ],
      reviewsDue: 0,
      streak: 1,
      weeklyProgress: 10,
      motivationalQuote: getMotivationalQuote(),
      honestPerformanceNote: `Targeting 8.5+ IELTS & CTO Senior Engineering level.`,
      ieltsFocusToday: `Today's IELTS Focus: Reading (30 mins)`
    };
  }
}

// ---- Helpers ----

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getStartOfWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

const QUOTES = [
  'Consistency beats intensity. Show up every day.',
  'Targeting Netherlands, Estonia, Germany, Ireland. Focus on the standard.',
  'Code like a Staff Engineer. Explain like a CTO.',
  'First, understand the system architecture. Then, write the code.',
  'IELTS 8.5+ requires rich vocabulary and error-free complex grammar.',
];

function getMotivationalQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
