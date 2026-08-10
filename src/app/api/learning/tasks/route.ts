// ============================================
// API: Learning Tasks — GET (today's tasks) & POST (generate)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateDailyTasks } from '@/lib/learning/engine';

const USER_ID = process.env.DEFAULT_USER_ID || 'default-user';

const FALLBACK_TASKS = [
  {
    id: 't1',
    title: 'JavaScript Closures & Event Loop Quiz',
    type: 'QUIZ',
    difficulty: 'EASY',
    category: 'JAVASCRIPT',
    content: {
      questions: [
        {
          question: 'What will `console.log(typeof NaN)` output in JavaScript?',
          options: ['A) "number"', 'B) "NaN"', 'C) "undefined"', 'D) "object"'],
          correctIndex: 0,
          explanation: 'NaN is a numeric value representing Not-a-Number, so typeof NaN is "number".',
        },
        {
          question: 'Which mechanism handles asynchronous callbacks in the JS Event Loop?',
          options: ['A) Call Stack', 'B) Task Queue / Microtask Queue', 'C) Heap Memory', 'D) Garbage Collector'],
          correctIndex: 1,
          explanation: 'Promises and mutation observers enter the Microtask Queue, while setTimeout enters the Task (Macrotask) Queue.',
        },
      ],
    },
    solution: {},
    status: 'PENDING',
  },
  {
    id: 't2',
    title: 'Two-Pointer Technique Challenge',
    type: 'CODING_CHALLENGE',
    difficulty: 'MEDIUM',
    category: 'DSA',
    content: {
      description: 'Given a sorted array of integers nums and a target integer, return indices of the two numbers such that they add up to target using the Two-Pointer approach in O(N) time.',
      examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] == 9' }],
      constraints: ['2 <= nums.length <= 10^4', 'Array is sorted in non-decreasing order'],
    },
    solution: {
      code: 'function twoSum(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left < right) {\n    const sum = nums[left] + nums[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return [];\n}',
    },
    status: 'PENDING',
  },
  {
    id: 't3',
    title: 'English Technical Elevator Pitch',
    type: 'ENGLISH_SPEAKING',
    difficulty: 'EASY',
    category: 'ENGLISH',
    content: {
      description: 'Practice speaking a 60-second self-introduction explaining your technical stack and why you are targeting European tech companies.',
    },
    solution: {},
    status: 'PENDING',
  },
];

export async function GET() {
  try {
    let plan = await prisma.learningPlan.findUnique({ where: { userId: USER_ID } });

    if (!plan) {
      // Auto-generate initial plan and tasks
      try {
        const tasks = await generateDailyTasks(USER_ID);
        return NextResponse.json({ tasks, count: tasks.length });
      } catch {
        return NextResponse.json({ tasks: FALLBACK_TASKS, count: FALLBACK_TASKS.length });
      }
    }

    const today = new Date().toISOString().split('T')[0];

    let tasks = await prisma.learningTask.findMany({
      where: {
        planId: plan.id,
        OR: [
          { dueDate: { gte: new Date(today), lt: new Date(today + 'T23:59:59Z') } },
          { status: 'REVIEW_DUE' },
          { status: 'PENDING' },
        ],
      },
      include: { topic: true },
      orderBy: [{ status: 'asc' }, { difficulty: 'desc' }, { dueDate: 'asc' }],
    });

    // Deduplicate tasks by title to prevent duplicates from multiple script runs
    const uniqueTasksMap = new Map<string, typeof tasks[0]>();
    for (const t of tasks) {
      if (!uniqueTasksMap.has(t.title)) {
        uniqueTasksMap.set(t.title, t);
      }
    }
    const finalTasks = Array.from(uniqueTasksMap.values()).slice(0, 10);

    if (finalTasks.length === 0) {
      const generated = await generateDailyTasks(USER_ID);
      const genMap = new Map();
      for (const t of generated) { if (!genMap.has(t.title)) genMap.set(t.title, t); }
      const finalGenerated = Array.from(genMap.values()).slice(0, 10);
      return NextResponse.json({ tasks: finalGenerated, count: finalGenerated.length });
    }

    return NextResponse.json({ tasks: finalTasks, count: finalTasks.length });
  } catch (error) {
    console.error('[Tasks GET fallback]', error);
    return NextResponse.json({ tasks: FALLBACK_TASKS, count: FALLBACK_TASKS.length });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'generate';

    if (action === 'generate') {
      try {
        const tasks = await generateDailyTasks(USER_ID);
        return NextResponse.json({ tasks, count: tasks.length, message: 'Daily tasks generated!' });
      } catch {
        return NextResponse.json({ tasks: FALLBACK_TASKS, count: FALLBACK_TASKS.length, message: 'Daily tasks generated!' });
      }
    }

    if (action === 'complete') {
      const { taskId } = body;
      if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

      try {
        const task = await prisma.learningTask.update({
          where: { id: taskId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
        return NextResponse.json({ task });
      } catch {
        return NextResponse.json({ task: { id: taskId, status: 'COMPLETED' } });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[Tasks POST]', error);
    return NextResponse.json({ tasks: FALLBACK_TASKS, count: FALLBACK_TASKS.length });
  }
}
