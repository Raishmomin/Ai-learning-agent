// ============================================
// Shared Types for the Learning Agent
// ============================================

export interface DailySummary {
  date: string;
  greeting: string;
  tasksToday: TaskSummaryItem[];
  reviewsDue: number;
  streak: number;
  weeklyProgress: number; // 0-100 percentage
  motivationalQuote: string;
  honestPerformanceNote?: string;
  ieltsFocusToday?: string;
}

export interface TaskSummaryItem {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  category: string;
  estimatedMinutes: number;
  isReview: boolean;
  allocatedSec?: number;
  status?: string;
  score?: number;
}

export interface EvaluationResult {
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string;
  quality: number; // 0-5 for SM-2
  ieltsBand?: number; // 0-9 for IELTS tasks
}

export interface TestCase {
  input: string;
  expected: string;
  description?: string;
}

export interface TestResult {
  testIndex: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

export interface RepetitionUpdate {
  nextReviewDate: Date;
  interval: number;
  easeFactor: number;
  repetitionLevel: number;
}

export interface InterviewMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
}

export interface CurriculumWeek {
  weekNumber: number;
  month: number;
  theme: string;
  topics: CurriculumTopic[];
  dailyModules?: Record<string, ModuleConfig>;
}

export interface CurriculumTopic {
  title: string;
  category: string;
  description: string;
  taskTypes: string[];
  difficulty: string;
  subtopics?: string[];
  targetCompany?: string;
}

export interface ModuleConfig {
  topic: string;
  description: string;
  difficulty: string;
  durationMinutes: number;
  taskType: string;
  category: string;
}

export interface ScheduleBlock {
  activity: string;
  durationMinutes: number;
  taskType: string;
  category: string;
}

export interface VocabularyWord {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  collocations: string[];
  synonyms: string[];
  technicalUsage: string;
}

