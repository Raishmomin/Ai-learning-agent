// ============================================
// 6-Month Career OS Curriculum — 24-Week Master Plan
// Target: Senior Tech Roles in Netherlands, Estonia, Germany, Ireland
// Target Companies: Booking.com, Adyen, Bolt, Wise, Stripe, GitLab, Datadog
// ============================================

import type { CurriculumWeek, ModuleConfig } from '@/types';

export function getIELTSFocusForDay(dayOfWeek: number): { skill: string; taskType: string; durationMinutes: number } {
  // 1 = Monday, 2 = Tuesday ... 7 = Sunday
  switch (dayOfWeek) {
    case 1:
      return { skill: 'Reading', taskType: 'IELTS_READING', durationMinutes: 30 };
    case 2:
      return { skill: 'Listening', taskType: 'IELTS_LISTENING', durationMinutes: 25 };
    case 3:
      return { skill: 'Speaking', taskType: 'IELTS_SPEAKING', durationMinutes: 20 };
    case 4:
      return { skill: 'Writing', taskType: 'IELTS_WRITING', durationMinutes: 40 };
    case 5:
      return { skill: 'Mock Exam', taskType: 'IELTS_READING', durationMinutes: 60 };
    case 6:
      return { skill: 'Grammar Deep Dive', taskType: 'GRAMMAR', durationMinutes: 30 };
    case 0:
    case 7:
    default:
      return { skill: 'Grammar & Review', taskType: 'GRAMMAR', durationMinutes: 30 };
  }
}

export const CURRICULUM: CurriculumWeek[] = [
  // ============================================
  // MONTH 1: JS, TS, React & Next.js Internals (Weeks 1-4)
  // ============================================
  {
    weekNumber: 1, month: 1,
    theme: 'JavaScript Engine Internals & Memory Model',
    topics: [
      {
        title: 'JS Event Loop, Microtasks & Memory Model',
        category: 'JAVASCRIPT',
        description: 'V8 call stack, task vs microtask queues, closure memory leaks, GC algorithms.',
        taskTypes: ['DEEP_TECHNICAL', 'CASE_STUDY', 'ENGINEERING_CHALLENGE', 'PRODUCTION_INCIDENT'],
        difficulty: 'HARD',
        subtopics: ['Event Loop & Microtasks', 'Closures & Scope Chain', 'Prototypes & Proxies', 'Promises & Async', 'V8 Memory & GC'],
        targetCompany: 'Booking.com'
      }
    ],
    dailyModules: {
      vocabulary: { topic: 'Beginner English Vocabulary: Everyday Workplace Words (A1)', description: '10 basic English words + simple example sentences', difficulty: 'EASY', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Beginner English: Daily Routines & Present Simple Tense (A1)', description: 'Basic sentence structure & speaking drill for beginners', difficulty: 'EASY', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'JavaScript Event Loop & Execution Context', description: 'University-depth masterclass on V8 internals', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'JAVASCRIPT' },
      caseStudy: { topic: 'How Booking.com Handles 1M+ Bookings/Day', description: 'High-availability architecture deep dive', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'JWT Auth System with Refresh Tokens', description: 'Production-grade authentication implementation', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'SECURITY' },
      productionIncident: { topic: 'DB Connection Pool Exhaustion at Peak Traffic', description: 'P0 outage interactive debugging', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'DATABASE' },
      codeReview: { topic: 'Node.js Express Middleware Vulnerabilities', description: 'Identify security and performance bugs in PR', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'NODEJS' },
      systemDesign: { topic: 'Design a High-Throughput URL Shortener', description: 'Small-scale system design baseline', difficulty: 'MEDIUM', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Embeddings & Vector Search Fundamentals', description: 'Understanding dense vectors and similarity math', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Linux Process Management & Networking Basics', description: 'h top, lsof, netstat, systemd, file permissions', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 2, month: 1,
    theme: 'Advanced TypeScript & Type System Design',
    topics: [
      {
        title: 'TypeScript Generics, Mapped Types & Compiler',
        category: 'TYPESCRIPT',
        description: 'Conditional types, infer keyword, mapped types, branded types, AST transforms.',
        taskTypes: ['DEEP_TECHNICAL', 'CASE_STUDY', 'ENGINEERING_CHALLENGE'],
        difficulty: 'HARD',
        subtopics: ['Generics Deep Dive', 'Mapped & Utility Types', 'Type Guards & Narrowing', 'Decorators & Metadata', 'TS Compiler Internals'],
        targetCompany: 'Adyen'
      }
    ],
    dailyModules: {
      vocabulary: { topic: 'Beginner English: Essential Verbs & Action Words (A1)', description: '10 fundamental English verbs with audio practice', difficulty: 'EASY', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Beginner English: Talking About Past Projects & Past Simple Tense (A1/A2)', description: 'Learn to use was/were/did in basic English', difficulty: 'EASY', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'TypeScript Advanced Type System & Metaprogramming', description: 'Building type-safe domain models', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'TYPESCRIPT' },
      caseStudy: { topic: 'Adyen Payment Gateway Zero-Downtime Pipeline', description: 'Global payment resilience architecture', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Distributed Rate Limiter (Token Bucket Algorithm)', description: 'Implement token bucket rate limiter in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'Redis Cache Stampede / Thundering Herd Outage', description: 'Debugging production cache miss storm', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'MONITORING' },
      codeReview: { topic: 'Generic TypeScript Data Repository Layer', description: 'Audit generic TS code for type safety flaws', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'TYPESCRIPT' },
      systemDesign: { topic: 'Design a Distributed Pastebin Service', description: 'Small-to-medium scale paste service', difficulty: 'MEDIUM', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Text Chunking Strategies & Overlap Evaluation', description: 'Optimizing context windows for RAG', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Docker Containerization & Multi-Stage Builds', description: 'Creating minimal secure production Dockerfiles', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DOCKER' }
    }
  },
  {
    weekNumber: 3, month: 1,
    theme: 'React Internals, Fiber Architecture & Concurrent Mode',
    topics: [
      {
        title: 'React Fiber, Reconciliation & Server Components',
        category: 'REACT_NEXTJS',
        description: 'Fiber tree structure, work loop, concurrent rendering, custom hook linked list.',
        taskTypes: ['DEEP_TECHNICAL', 'CASE_STUDY', 'ENGINEERING_CHALLENGE'],
        difficulty: 'HARD',
        subtopics: ['Fiber Architecture', 'Hooks Internals', 'Rendering Pipeline', 'React Performance', 'Server Components'],
        targetCompany: 'Wise'
      }
    ],
    dailyModules: {
      vocabulary: { topic: 'Beginner English: Office & Team Communication Vocabulary (A2)', description: '10 workplace communication words with simple drills', difficulty: 'EASY', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Beginner English: Asking Questions & Modal Verbs (Can, Could, Should) (A2)', description: 'Practice asking help and expressing ideas in simple English', difficulty: 'EASY', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'React Fiber Engine & Concurrent Rendering Pipeline', description: 'Mastering React 19 reconciliation internals', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'REACT_NEXTJS' },
      caseStudy: { topic: 'Wise Multi-Currency Real-Time Ledger System', description: 'Event-driven money transfer architecture', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Build an In-Memory Cache with TTL & LRU Eviction', description: 'Implement LRU cache data structure in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'DSA' },
      productionIncident: { topic: 'React Infinite Render Loop & Memory Spill', description: 'Diagnosing production browser memory leaks', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'REACT_NEXTJS' },
      codeReview: { topic: 'React Custom Hooks & Context Performance Review', description: 'Identify unnecessary re-renders in PR', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'REACT_NEXTJS' },
      systemDesign: { topic: 'Design TinyURL at Global Scale (100M QPS)', description: 'Medium scale distributed URL shortener', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Building a Basic RAG Pipeline with pgvector', description: 'End-to-end vector retrieval implementation', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Docker Compose & Container Networking', description: 'Orchestrating Node + PG + Redis locally', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DOCKER' }
    }
  },
  {
    weekNumber: 4, month: 1,
    theme: 'Next.js App Router, Streaming & Server Infrastructure',
    topics: [
      {
        title: 'Next.js App Router Architecture & Edge Runtime',
        category: 'REACT_NEXTJS',
        description: 'Server actions, caching layers, ISR, middleware, Edge runtime optimization.',
        taskTypes: ['DEEP_TECHNICAL', 'CASE_STUDY', 'ENGINEERING_CHALLENGE'],
        difficulty: 'HARD',
        subtopics: ['App Router Architecture', 'Server Actions', 'Caching & ISR', 'Middleware & Edge', 'Next.js Production'],
        targetCompany: 'Bolt'
      }
    ],
    dailyModules: {
      vocabulary: { topic: 'Beginner English: Adjectives & Describing Work (A2)', description: '10 describing words with simple practice sentences', difficulty: 'EASY', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Beginner English: Expressing Opinions & Connecting Sentences (A2)', description: 'Learn because, but, so, and simple linking words', difficulty: 'EASY', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Next.js 15 Full-Stack Architecture & Caching Layers', description: 'Building resilient serverless Web apps', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'REACT_NEXTJS' },
      caseStudy: { topic: 'Bolt Dispatch & High-Frequency Geospatial Driver Matching', description: 'Real-time vehicle location system at scale', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Background Job Worker with Retry & Dead-Letter Queue', description: 'Asynchronous task queue processing engine', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'Next.js Server Action CSRF Vulnerability & Outage', description: 'P0 security patch and deployment fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'SECURITY' },
      codeReview: { topic: 'Next.js App Router API Route & Middleware PR', description: 'Review route handlers for auth and caching bugs', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'REACT_NEXTJS' },
      systemDesign: { topic: 'Design a Real-time Chat Application (Slack/Discord S)', description: 'WebSocket connections and message persistence', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Prompt Engineering Techniques (CoT, Few-Shot, JSON Mode)', description: 'Reliable LLM output structuring', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'NGINX Reverse Proxy & SSL/TLS Termination', description: 'Configuring NGINX load balancer with SSL', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },

  // ============================================
  // MONTH 2: Node.js, Cloud & Backend (Weeks 5-8)
  // ============================================
  {
    weekNumber: 5, month: 2,
    theme: 'Node.js Event Loop, Streams & Worker Threads',
    topics: [{ title: 'Node.js Architecture & High Performance', category: 'NODEJS', description: 'libuv, streams, workers, clusters.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Stripe' }],
    dailyModules: {
      vocabulary: { topic: 'Backend Systems & Concurrency Vocabulary', description: '10 concurrency words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining Asynchronous Architecture to Senior Engineers', description: 'Technical fluency drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Node.js libuv Event Loop & Streams Deep Dive', description: 'Zero-copy I/O and backpressure management', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'NODEJS' },
      caseStudy: { topic: 'Stripe Global Payment Processing Engine', description: 'Handling high financial throughput', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Build an Immutable Audit Log System', description: 'Event sourcing log implementation', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'Node.js Event Loop Blocked by Synchronous JSON Parse', description: 'Lag spike investigation and fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'NODEJS' },
      codeReview: { topic: 'Stream Processing & File Upload Route Review', description: 'Detecting memory leaks in Node streams', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'NODEJS' },
      systemDesign: { topic: 'Design a Payment Gateway System (Adyen/Stripe)', description: 'Idempotency and distributed transactions', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'AI Agent Architectures (ReAct & Tool Calling)', description: 'Building autonomous tool-using agents', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'AWS EC2, VPC, Subnets & Security Groups', description: 'Cloud infrastructure setup', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'CLOUD_AWS' }
    }
  },
  {
    weekNumber: 6, month: 2,
    theme: 'PostgreSQL Indexing, Query Plans & Transactions',
    topics: [{ title: 'PostgreSQL Deep Dive', category: 'DATABASE', description: 'B-tree, GIN, EXPLAIN ANALYZE, MVCC.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Shopify' }],
    dailyModules: {
      vocabulary: { topic: 'Database & Storage Engine Vocabulary', description: '10 database terminology words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Defending Database Architecture Choices in an Interview', description: 'System design communication drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'PostgreSQL Internals, B-Tree Indexing & Query Tuning', description: 'Reading query plans and optimizing SQL', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'DATABASE' },
      caseStudy: { topic: 'Shopify Flash Sale Database Sharding Architecture', description: 'Handling massive database write surges', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Notification Dispatch Engine (Email, Push, SMS)', description: 'Multi-channel priority queue worker', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'PostgreSQL Unindexed Foreign Key Locking Outage', description: 'Database deadlock resolution', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'DATABASE' },
      codeReview: { topic: 'PostgreSQL Migration & Prisma Schema Review', description: 'Finding breaking schema changes', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'DATABASE' },
      systemDesign: { topic: 'Design an E-Commerce Flash Sale Platform (Shopify)', description: 'Inventory locking and high throughput', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Model Context Protocol (MCP) Server Setup', description: 'Creating custom MCP tools for LLMs', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'AWS S3, Lambda & Serverless Backend Setup', description: 'Deploying serverless functions', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'CLOUD_AWS' }
    }
  },
  {
    weekNumber: 7, month: 2,
    theme: 'Redis Caching & Distributed Message Queues',
    topics: [{ title: 'Redis & Queue Systems', category: 'DEVOPS', description: 'Data structures, Pub/Sub, BullMQ, Kafka.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Discord' }],
    dailyModules: {
      vocabulary: { topic: 'Caching & Asynchronous Messaging Terms', description: '10 queue and messaging words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining Distributed Queues in English', description: 'System design interview practice', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Redis Data Structures & Distributed Caching Strategies', description: 'Cache-aside, write-through, Pub/Sub, Streams', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'DATABASE' },
      caseStudy: { topic: 'Discord Millions of Concurrent WebSockets System', description: 'Erlang/Elixir & Rust architecture', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Chunked File Upload Pipeline with S3 Direct Upload', description: 'Multipart upload with presigned URLs', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'RabbitMQ Queue Backup & Consumer Memory OOM', description: 'Backpressure failure investigation', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'MONITORING' },
      codeReview: { topic: 'Redis Cache Layer & Pub/Sub Subscriber Review', description: 'Checking for unhandled disconnections', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'DATABASE' },
      systemDesign: { topic: 'Design Discord Architecture (Large Scale Chat)', description: 'Real-time gateway and message store', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'LangGraph Workflows & State Machines', description: 'Building complex cyclical AI agents', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Kubernetes Pods, Deployments & Services Basics', description: 'Deploying Node app on K8s cluster', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'KUBERNETES' }
    }
  },
  {
    weekNumber: 8, month: 2,
    theme: 'Microservices vs Monolith & API Design',
    topics: [{ title: 'Microservices & Distributed APIs', category: 'ARCHITECTURE', description: 'REST, GraphQL, gRPC, Saga pattern.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Netflix' }],
    dailyModules: {
      vocabulary: { topic: 'Microservices & API Architecture Terms', description: '10 microservices vocabulary words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Behavioral Question: Handling Architectural Disagreements', description: 'IELTS / Behavioral fluency drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'BEHAVIOURAL' },
      deepTechnical: { topic: 'Microservices Patterns: Saga, CQRS & Circuit Breaker', description: 'Designing fault-tolerant microservices', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'ARCHITECTURE' },
      caseStudy: { topic: 'Netflix Microservices & Chaos Engineering Architecture', description: 'Chaos Monkey & resiliency at scale', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Circuit Breaker & Fallback Wrapper', description: 'Resilience pattern implementation in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'Cascading Microservice Outage from Lack of Timeout', description: 'P0 outage investigation and resolution', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'ARCHITECTURE' },
      codeReview: { topic: 'gRPC Protobuf Definition & Microservice Client Review', description: 'Audit RPC interface for compatibility', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'ARCHITECTURE' },
      systemDesign: { topic: 'Design Netflix Video Streaming Platform (Large Scale)', description: 'Video encoding pipeline & CDN distribution', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Multi-Agent Orchestration & Consensus Building', description: 'Managing team of specialized AI agents', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Helm Charts & Kubernetes Config Management', description: 'Packaging and deploying K8s charts', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'KUBERNETES' }
    }
  },

  // ============================================
  // MONTH 3: System Design & Distributed Systems (Weeks 9-12)
  // ============================================
  {
    weekNumber: 9, month: 3,
    theme: 'CAP Theorem, Consensus & Distributed Storage',
    topics: [{ title: 'Distributed Systems Fundamentals', category: 'SYSTEM_DESIGN', description: 'Raft, Paxos, Sharding, Replication.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'GitHub' }],
    dailyModules: {
      vocabulary: { topic: 'Distributed Consensus & Storage Vocabulary', description: '10 consensus words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining Consensus Algorithms to an Engineering Panel', description: 'High-stakes tech communication', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'CAP Theorem, Raft Consensus & Distributed Storage', description: 'How distributed databases guarantee consistency', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'SYSTEM_DESIGN' },
      caseStudy: { topic: 'GitHub High Availability & Database Clustering', description: 'Orchestration of MySQL active-passive cluster', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Distributed In-Memory Search Index (BM25)', description: 'Building full-text search engine in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'DSA' },
      productionIncident: { topic: 'Split-Brain Scenario in Redis Cluster Outage', description: 'Data inconsistency remediation', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'SYSTEM_DESIGN' },
      codeReview: { topic: 'Distributed Lock Implementation Review (Redlock)', description: 'Finding race conditions in lock implementation', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'SYSTEM_DESIGN' },
      systemDesign: { topic: 'Design Google Drive / Dropbox Cloud Storage', description: 'File chunking, deduplication, and sync', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'AI Evaluation & RAG Benchmark Frameworks', description: 'Measuring retrieval accuracy & hallucinations', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Terraform Basics & Infrastructure as Code (IaC)', description: 'Writing Terraform scripts for AWS resources', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 10, month: 3,
    theme: 'Load Balancing, CDNs & Rate Limiting at Scale',
    topics: [{ title: 'High Availability & Traffic Management', category: 'SYSTEM_DESIGN', description: 'L4 vs L7 load balancing, CDNs, rate limiters.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Uber' }],
    dailyModules: {
      vocabulary: { topic: 'Network Protocols & Edge Infrastructure Terms', description: '10 networking words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Simulating a System Design Interview Architecture Discussion', description: 'Mock interview drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Global Traffic Management: L4/L7 Load Balancers & CDNs', description: 'Anycast routing, NGINX, Cloudflare edge functions', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'SYSTEM_DESIGN' },
      caseStudy: { topic: 'Uber Real-Time Location Dispatch Architecture (Ringpop)', description: 'Consistent hashing and geospatial indexing', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Real-Time Analytics Aggregation Dashboard Engine', description: 'Sliding window metric calculator', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'CDN Misconfiguration Caching Private User Data', description: 'P0 security breach response and fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'SECURITY' },
      codeReview: { topic: 'Sliding Window Rate Limiter Middleware PR', description: 'Audit atomic Redis operations in rate limiter', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'SYSTEM_DESIGN' },
      systemDesign: { topic: 'Design Uber / Lyft Ride Matching Platform', description: 'Geospatial indexing (H3/S2) and dispatch', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'LLM Fine-Tuning & Dataset Preparation', description: 'LoRA / QLoRA fine-tuning concepts', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'CI/CD Pipelines with GitHub Actions & Docker', description: 'Automating build, test, and container push', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 11, month: 3,
    theme: 'Networking, Security & OAuth 2.0 / OIDC Deep Dive',
    topics: [{ title: 'Web Security & Protocol Engineering', category: 'SECURITY', description: 'HTTP/2, HTTP/3, OAuth 2.0, OWASP Top 10.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Instagram' }],
    dailyModules: {
      vocabulary: { topic: 'Security & Authentication Vocabulary', description: '10 web security words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining Security Vulnerabilities to Executive Leadership', description: 'Security communication practice', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'HTTP/3, OAuth 2.0, OIDC & Web Security Masterclass', description: 'Preventing OWASP Top 10 vulnerabilities in production', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'SECURITY' },
      caseStudy: { topic: 'Instagram Media Storage & Feed Generation Architecture', description: 'Serving billions of images with minimal latency', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'OAuth 2.0 Authorization Server Implementation', description: 'Build OAuth token endpoint with PKCE in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'SECURITY' },
      productionIncident: { topic: 'OAuth Refresh Token Hijacking Outage', description: 'Token revocation and vulnerability fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'SECURITY' },
      codeReview: { topic: 'Security Audit: Finding SQLi, XSS, and SSRF in PR', description: 'Identify OWASP vulnerabilities in code', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'SECURITY' },
      systemDesign: { topic: 'Design Twitter / X News Feed Architecture', description: 'Fan-out on write vs fan-out on read', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Hybrid Search (Vector Search + BM25 Lexical Search)', description: 'Combining dense & sparse retrieval in pgvector', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Prometheus & Grafana Monitoring & Alerting Setup', description: 'Configuring metrics collection & alerts', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'MONITORING' }
    }
  },
  {
    weekNumber: 12, month: 3,
    theme: 'Event Sourcing, CQRS & Cloudflare Edge Computing',
    topics: [{ title: 'Advanced Event-Driven Architecture', category: 'ARCHITECTURE', description: 'Event sourcing, CQRS, Cloudflare Workers.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Cloudflare' }],
    dailyModules: {
      vocabulary: { topic: 'Event Sourcing & Edge Computing Terms', description: '10 event-driven terms', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Presenting an Architecture Decision Record (ADR) in English', description: 'ADR defense practice', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Event Sourcing, CQRS & Edge Compute Architectures', description: 'Building auditably complete event systems', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'ARCHITECTURE' },
      caseStudy: { topic: 'Cloudflare Edge Network & Global DDoS Defense', description: 'Inspecting millions of requests per second', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'WebSocket Chat Server with Heartbeat & Auto-Reconnect', description: 'Resilient WebSocket connection manager', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'Out-of-Order Event Processing Data Corruption', description: 'Event replay & idempotency fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'ARCHITECTURE' },
      codeReview: { topic: 'CQRS Event Handler & Command Dispatcher Review', description: 'Finding race conditions in event handlers', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'ARCHITECTURE' },
      systemDesign: { topic: 'Design Slack Architecture (Enterprise Level)', description: 'Channel persistence, presence, and search', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'AI Safety & Prompt Guardrails Implementation', description: 'Detecting prompt injection & PII leaks', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'OpenTelemetry & Distributed Tracing Setup', description: 'Tracing requests across microservices', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'MONITORING' }
    }
  },

  // ============================================
  // MONTH 4: AI Engineering & Modern Stack (Weeks 13-16)
  // ============================================
  {
    weekNumber: 13, month: 4,
    theme: 'Transformers, Embeddings & RAG Production Systems',
    topics: [{ title: 'LLMs & AI Engineering Core', category: 'AI_ML', description: 'Transformers, Attention, RAG, Chunking.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'ChatGPT' }],
    dailyModules: {
      vocabulary: { topic: 'AI & Machine Learning Engineering Terms', description: '10 AI engineering words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining AI Systems Architecture in Senior Technical Interviews', description: 'AI fluency drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Transformer Architecture, Attention Mechanism & RAG Systems', description: 'Deep dive into LLM internals and retrieval', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'AI_ML' },
      caseStudy: { topic: 'ChatGPT Real-Time Streaming & Inference Architecture', description: 'Serving millions of concurrent AI streams', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Build an End-to-End RAG Chatbot Pipeline', description: 'Embeddings, pgvector, and stream response', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'AI_ML' },
      productionIncident: { topic: 'Vector Database Memory Exhaustion & High Latency Outage', description: 'Index tuning and HNSW optimization', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'AI_ML' },
      codeReview: { topic: 'RAG Pipeline Context Injection & Security Review', description: 'Audit prompt templates for injection flaws', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'AI_ML' },
      systemDesign: { topic: 'Design an AI-Powered Search Platform (Perplexity S)', description: 'Hybrid search, crawler, and LLM synthesis', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Production RAG Optimization & Reranking Models', description: 'Using Cohere/BGE rerankers for accuracy', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'AWS ECS & Fargate Container Deployment', description: 'Deploying containerized AI microservices', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'CLOUD_AWS' }
    }
  },
  {
    weekNumber: 14, month: 4,
    theme: 'AI Agents, Model Context Protocol (MCP) & LangGraph',
    topics: [{ title: 'Autonomous AI Agents', category: 'AI_ML', description: 'MCP, LangGraph, Multi-Agent systems.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Spotify' }],
    dailyModules: {
      vocabulary: { topic: 'Agentic Workflows & Multi-Agent Terms', description: '10 agentic AI words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Pitching an AI Agent Integration Strategy to Leadership', description: 'Executive presentation drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'AI Agent Architecture, MCP Servers & LangGraph State Machines', description: 'Building resilient agentic workflows', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'AI_ML' },
      caseStudy: { topic: 'Spotify AI Recommendation & Personalization Engine', description: 'Vector embeddings for music matching', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Semantic Search Engine with Re-ranking', description: 'Implementing hybrid vector + BM25 search', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'AI_ML' },
      productionIncident: { topic: 'AI Agent Infinite Loop Spawning Thousands of API Calls', description: 'Agent loop termination and safety fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'AI_ML' },
      codeReview: { topic: 'MCP Tool Definition & Function Calling Code Review', description: 'Reviewing tool schemas for safety', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'AI_ML' },
      systemDesign: { topic: 'Design Spotify Recommendation Platform', description: 'Real-time feature store & vector matching', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Building a Multi-Agent Debate System with LangGraph', description: 'Multi-agent consensus implementation', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Service Mesh (Istio) & Traffic Management Basics', description: 'Configuring mTLS and traffic splitting', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 15, month: 4,
    theme: 'Vector Databases, Streaming & Real-Time AI Infra',
    topics: [{ title: 'Vector DBs & Real-Time AI Infrastructure', category: 'AI_ML', description: 'pgvector, HNSW, SSE streaming, vLLM.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Datadog' }],
    dailyModules: {
      vocabulary: { topic: 'Vector DBs & High Performance AI Terms', description: '10 vector DB words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Debating Infrastructure Choices (pgvector vs Pinecone)', description: 'Architectural debate drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Vector Database Internals (HNSW, IVF-PQ) & Streaming SSE', description: 'High-speed vector indexing and streaming', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'AI_ML' },
      caseStudy: { topic: 'Datadog Real-Time Telemetry & Log Ingestion Pipeline', description: 'Processing trillions of data points per day', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Automated AI Code Review Bot Component', description: 'AST parser + LLM prompt review pipeline', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'AI_ML' },
      productionIncident: { topic: 'SSE Connection Leak Causing Server Memory Starvation', description: 'Fixing streaming connection lifecycle', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'NODEJS' },
      codeReview: { topic: 'SSE Streaming & LLM Token Parser Code Review', description: 'Audit streaming handlers for memory leaks', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'AI_ML' },
      systemDesign: { topic: 'Design Datadog Real-Time Monitoring System', description: 'Time-series database and alert engine', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Production AI Inference Optimization & Quantization', description: 'vLLM and token generation optimization', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Cloud Security: AWS WAF, KMS & Secrets Manager', description: 'Securing API keys and secrets in cloud', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'SECURITY' }
    }
  },
  {
    weekNumber: 16, month: 4,
    theme: 'Authentication, RBAC & Full-Stack Security Architecture',
    topics: [{ title: 'Production Security & Auth Systems', category: 'SECURITY', description: 'OIDC, RBAC, ABAC, Zero Trust.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'GitLab' }],
    dailyModules: {
      vocabulary: { topic: 'Identity, Access Control & Authorization Terms', description: '10 security & RBAC words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining Zero Trust Architecture in Senior Interviews', description: 'Security speaking practice', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Zero Trust Security, RBAC / ABAC Policy Engines & OIDC', description: 'Designing enterprise-grade identity systems', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'SECURITY' },
      caseStudy: { topic: 'GitLab Global CI/CD Runner Architecture', description: 'Isolated container execution at scale', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'RBAC Policy Engine & Dynamic API Key Validator', description: 'Build Casbin-like permission checker in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'SECURITY' },
      productionIncident: { topic: 'Privilege Escalation Security Bug in RBAC Middleware', description: 'Emergency security patch deployment', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'SECURITY' },
      codeReview: { topic: 'RBAC Authorization Middleware Code Review', description: 'Audit permission checks for bypass bugs', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'SECURITY' },
      systemDesign: { topic: 'Design GitHub / GitLab Platform (Code Storage & CI)', description: 'Git object store and runner queue', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'AI Deployment Patterns & Model Versioning', description: 'Blue-green deploys for LLM prompts & models', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Production Kubernetes Cluster Security Hardening', description: 'NetworkPolicies, RBAC, and pod security', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'KUBERNETES' }
    }
  },

  // ============================================
  // MONTH 5: Production Engineering & DevOps (Weeks 17-20)
  // ============================================
  {
    weekNumber: 17, month: 5,
    theme: 'Observability — Logs, Metrics, Traces & Incident Response',
    topics: [{ title: 'Full Stack Observability', category: 'MONITORING', description: 'OpenTelemetry, Prometheus, Grafana, Loki.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Amazon' }],
    dailyModules: {
      vocabulary: { topic: 'Observability & Telemetry Terminology', description: '10 SRE words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Conducting a Postmortem Incident Review in English', description: 'SRE leadership speaking drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Observability Masterclass: Logs, Metrics, Traces & OpenTelemetry', description: 'Building actionable telemetry pipelines', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'MONITORING' },
      caseStudy: { topic: 'Amazon Prime Day Scale Infrastructure & Resilience', description: 'Handling peak global shopping traffic', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Node.js Memory Leak Detector Utility', description: 'Build heap snapshot diffing tool in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'Cascading Outage from Log Ingestion Buffer Overflow', description: 'Log pipeline backpressure fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'MONITORING' },
      codeReview: { topic: 'OpenTelemetry Instrumentation Code Review', description: 'Audit span propagation and context leaks', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'MONITORING' },
      systemDesign: { topic: 'Design a Global Content Delivery Network (CDN)', description: 'Edge caching, DNS routing, and purges', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Agentic RAG & Dynamic Tool Selection Engine', description: 'RAG with adaptive query routing', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Incident Response Playbooks & PagerDuty Integration', description: 'Automating on-call alerts and runs', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 18, month: 5,
    theme: 'Docker Internals, Container Security & Isolation',
    topics: [{ title: 'Container Security & Docker Internals', category: 'DOCKER', description: 'cgroups, namespaces, image layers, rootless.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Booking.com' }],
    dailyModules: {
      vocabulary: { topic: 'Container & Linux Kernel Security Words', description: '10 container security words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining Container Isolation & Security to Auditors', description: 'Security presentation drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Docker Internals: Linux Namespaces, cgroups & Image Scanning', description: 'Container runtime isolation deep dive', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'DOCKER' },
      caseStudy: { topic: 'Booking.com Container Platform Scaling (Thousands of Services)', description: 'Internal cloud platform architecture', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Automated Dependency Security Auditor Tool', description: 'Parsing package-lock.json for CVEs', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'SECURITY' },
      productionIncident: { topic: 'Docker Daemon Out of Disk Space & Container Eviction Outage', description: 'Cleanup and volume management fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'DOCKER' },
      codeReview: { topic: 'Dockerfile & Container Security Hardening PR Review', description: 'Audit Dockerfiles for root user & vulnerabilities', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'DOCKER' },
      systemDesign: { topic: 'Design a High-Security Online Banking Platform', description: 'End-to-end encryption and audit logging', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'AI Model Evaluation Framework (TruLens / Ragas)', description: 'Automating hallucination detection', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Chaos Engineering with Chaos Mesh / Gremlin', description: 'Injecting network latency & pod failure', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 19, month: 5,
    theme: 'Kubernetes Control Plane, Pod Scheduling & Autoscaling',
    topics: [{ title: 'Kubernetes Production Engineering', category: 'KUBERNETES', description: 'etcd, kubelet, HPA, VPA, Helm.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Zalando' }],
    dailyModules: {
      vocabulary: { topic: 'Kubernetes Architecture & Orchestration Terms', description: '10 K8s words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Explaining Kubernetes Infrastructure Decisions in Interviews', description: 'DevOps speaking practice', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Kubernetes Control Plane Internals, etcd & Custom Resource Definitions (CRDs)', description: 'Mastering K8s operator pattern', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'KUBERNETES' },
      caseStudy: { topic: 'Zalando Microservices Orchestration & Multi-Cluster K8s', description: 'Managing hundreds of K8s clusters', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Application Performance Profiler Wrapper', description: 'CPU flamegraph generation wrapper in Node', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'NODEJS' },
      productionIncident: { topic: 'K8s OOMKilled Pod Loop & HPA Thrashing Outage', description: 'Resource limits tuning and fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'KUBERNETES' },
      codeReview: { topic: 'Kubernetes Deployment & HPA YAML Manifest Review', description: 'Audit K8s manifests for missing probes', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'KUBERNETES' },
      systemDesign: { topic: 'Design Large-Scale Video Streaming Platform', description: 'Multi-region delivery & HLS transcoding', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Production AI Pipeline Monitoring & Drift Alerts', description: 'Detecting data drift in embeddings', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Load Testing with k6 / Artillery under High Concurrency', description: 'Writing k6 load test scripts', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 20, month: 5,
    theme: 'AWS & Cloud Architecture, IaC with Terraform',
    topics: [{ title: 'AWS Cloud Architecture & IaC', category: 'CLOUD_AWS', description: 'VPC, IAM, Terraform, Disaster Recovery.', taskTypes: ['DEEP_TECHNICAL'], difficulty: 'HARD', targetCompany: 'Pipedrive' }],
    dailyModules: {
      vocabulary: { topic: 'Cloud Architecture & Infrastructure Terms', description: '10 cloud infrastructure words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Defending AWS Cloud Architecture Decisions in Senior Interview', description: 'Cloud architecture presentation', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'AWS Multi-Region Cloud Architecture & Terraform Modules', description: 'Designing zero-downtime multi-region systems', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'CLOUD_AWS' },
      caseStudy: { topic: 'Pipedrive Multi-Tenant Database Architecture', description: 'Isolation and scaling for enterprise CRM', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Zero-Downtime Database Migration Tool', description: 'Dual-write and migration script engine', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'DATABASE' },
      productionIncident: { topic: 'AWS VPC Peering & Route Table Outage', description: 'Cross-region network partition fix', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'CLOUD_AWS' },
      codeReview: { topic: 'Terraform Infrastructure Module Review', description: 'Audit Terraform code for open security groups', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'CLOUD_AWS' },
      systemDesign: { topic: 'Design Hospital / Healthcare Information System', description: 'HIPAA compliance, encryption, and audit', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'AI Agent Monitoring & Trace Logging with LangSmith', description: 'Tracing agent execution chains', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Disaster Recovery Failover Simulation (RTO / RPO)', description: 'Executing database failover playbook', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'CLOUD_AWS' }
    }
  },

  // ============================================
  // MONTH 6: Interview Sprint & Offer Finalization (Weeks 21-24)
  // ============================================
  {
    weekNumber: 21, month: 6,
    theme: 'Full Mock Interview Sprint — DSA & System Design',
    topics: [{ title: 'Tier-1 European Mock Interview Sprint', category: 'SYSTEM_DESIGN', description: 'Timed DSA and System Design mock rounds.', taskTypes: ['MOCK_INTERVIEW'], difficulty: 'HARD', targetCompany: 'Booking.com' }],
    dailyModules: {
      vocabulary: { topic: 'Interview Vocabulary & Precision Phrasing', description: '10 interview impact words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Mock Interview English Response Refinement', description: 'Fluency & confidence drill', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Weak-Area Technical Review (Customized)', description: 'Targeting lowest-scoring categories', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'ARCHITECTURE' },
      caseStudy: { topic: 'Booking.com & Adyen Architectural Comparison', description: 'Comparing European unicorn stacks', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Hard LeetCode / Industrial System Challenge', description: 'Timed high-complexity coding problem', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'DSA' },
      productionIncident: { topic: 'Full Incident On-Call Simulation Round', description: 'Live SRE interview debugging scenario', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'MONITORING' },
      codeReview: { topic: 'Live Code Review Interview Simulation', description: 'PR review under 20-minute timer', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'TYPESCRIPT' },
      systemDesign: { topic: 'Full Mock System Design Interview (Adyen / Booking.com)', description: 'Comprehensive 60-min system design round', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'AI System Design Mock Interview Round', description: 'Designing enterprise RAG & Agent platform', difficulty: 'HARD', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'DevOps / Cloud Architecture Mock Interview Round', description: 'Live IaC and K8s design discussion', difficulty: 'HARD', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 22, month: 6,
    theme: 'Full Mock Interview Sprint — AI, DevOps & Behavioural',
    topics: [{ title: 'Full Panel Mock Interviews', category: 'BEHAVIOURAL', description: 'AI, DevOps, and CTO behavioural rounds.', taskTypes: ['MOCK_INTERVIEW'], difficulty: 'HARD', targetCompany: 'GitLab' }],
    dailyModules: {
      vocabulary: { topic: 'Leadership & Behavioral Communication Words', description: '10 executive leadership words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Mock Behavioral Interview (CTO & Director Level)', description: 'STAR method mastery', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'BEHAVIOURAL' },
      deepTechnical: { topic: 'Weak-Area Deep Technical Review Part 2', description: 'Addressing remaining technical gaps', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'SECURITY' },
      caseStudy: { topic: 'GitLab & Datadog Infrastructure Case Studies', description: 'DevOps & Telemetry deep dive', difficulty: 'HARD', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'High-Performance Algorithmic Optimization', description: 'Refactoring O(N^2) to O(N log N) in JS', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'DSA' },
      productionIncident: { topic: 'Multi-Region Outage Simulation', description: 'Live incident management', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'CLOUD_AWS' },
      codeReview: { topic: 'Complex Concurrent Code Review', description: 'Finding asynchronous race conditions', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'NODEJS' },
      systemDesign: { topic: 'Full Mock System Design (GitLab / Cloudflare style)', description: 'Edge compute and CI runner design', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Advanced AI Architecture Review', description: 'Evaluating LLM system tradeoffs', difficulty: 'HARD', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'K8s & Cloud Security Mock Interview', description: 'Securing cloud infrastructure live Q&A', difficulty: 'HARD', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 23, month: 6,
    theme: 'Target Company Deep Dives & Salary Negotiation (NL/EE/DE/IE)',
    topics: [{ title: 'Company Deep Dives & Offer Negotiation', category: 'NETWORKING', description: 'Booking.com, Adyen, Stripe, Bolt prep & relocation.', taskTypes: ['READING'], difficulty: 'MEDIUM', targetCompany: 'Adyen' }],
    dailyModules: {
      vocabulary: { topic: 'Contract, Salary & Relocation Negotiation Terms', description: '10 negotiation words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Salary Negotiation & Relocation Package Conversation', description: 'Negotiation speaking practice', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Company-Specific Technical Deep Dive (Booking.com & Adyen)', description: 'Reviewing tech stack and past questions', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'ARCHITECTURE' },
      caseStudy: { topic: 'European Visa & Relocation Requirements (NL 30% Ruling, EE Digital Visa)', description: 'Legal and tax optimization for Europe', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Fintech Payment Integration Simulation', description: '3D Secure auth and payment webhook runner', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'SECURITY' },
      productionIncident: { topic: 'Live Mock Incident Response', description: 'Final SRE interview practice', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'MONITORING' },
      codeReview: { topic: 'Senior Engineering PR Review Benchmark', description: 'Final PR review exercise', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'TYPESCRIPT' },
      systemDesign: { topic: 'Company-Specific Mock System Design Round', description: 'Simulating exact interview prompt for target company', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Production AI System Defense', description: 'Defending AI architecture in interview', difficulty: 'HARD', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Production Infrastructure Audit', description: 'Final cloud infrastructure check', difficulty: 'HARD', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  },
  {
    weekNumber: 24, month: 6,
    theme: 'Final Interview Sprint & Offer Decision',
    topics: [{ title: 'International Offer Sprint & Transition', category: 'NETWORKING', description: 'Final interviews, offer selection, relocation.', taskTypes: ['PROJECT_TASK'], difficulty: 'MEDIUM' }],
    dailyModules: {
      vocabulary: { topic: 'Executive Leadership & International Onboarding Words', description: '10 onboarding & leadership words', difficulty: 'MEDIUM', durationMinutes: 15, taskType: 'VOCABULARY', category: 'VOCABULARY' },
      english: { topic: 'Final Interview Readiness & Confidence Polish', description: 'Final speaking presentation', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'ENGLISH_SPEAKING', category: 'ENGLISH' },
      deepTechnical: { topic: 'Final Technical Mastery Review', description: 'Consolidating 6 months of senior engineering knowledge', difficulty: 'HARD', durationMinutes: 90, taskType: 'DEEP_TECHNICAL', category: 'ARCHITECTURE' },
      caseStudy: { topic: 'First 90 Days as Senior Engineer in a European Tech Company', description: 'Onboarding & high impact strategy', difficulty: 'MEDIUM', durationMinutes: 30, taskType: 'CASE_STUDY', category: 'CASE_STUDY' },
      engineeringChallenge: { topic: 'Final Coding Sprint', description: 'Timed challenge', difficulty: 'HARD', durationMinutes: 45, taskType: 'ENGINEERING_CHALLENGE', category: 'DSA' },
      productionIncident: { topic: 'Final Incident Debugging Check', description: 'P0 outage simulation', difficulty: 'HARD', durationMinutes: 30, taskType: 'PRODUCTION_INCIDENT', category: 'MONITORING' },
      codeReview: { topic: 'Final Code Review Sprint', description: '20-min PR audit', difficulty: 'MEDIUM', durationMinutes: 20, taskType: 'CODE_REVIEW', category: 'TYPESCRIPT' },
      systemDesign: { topic: 'Final System Design Benchmark Round', description: 'Tier-1 system design evaluation', difficulty: 'HARD', durationMinutes: 60, taskType: 'SYSTEM_DESIGN_QA', category: 'SYSTEM_DESIGN' },
      aiEngineering: { topic: 'Final AI Engineering Benchmark', description: 'AI platform design evaluation', difficulty: 'HARD', durationMinutes: 30, taskType: 'AI_ENGINEERING', category: 'AI_ML' },
      devops: { topic: 'Final DevOps Benchmark', description: 'Cloud architecture evaluation', difficulty: 'HARD', durationMinutes: 30, taskType: 'DEVOPS_LAB', category: 'DEVOPS' }
    }
  }
];

export function getWeekCurriculum(weekNumber: number): CurriculumWeek | undefined {
  return CURRICULUM.find((w) => w.weekNumber === weekNumber);
}

export function getCurrentWeek(startDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(24, Math.floor(diffDays / 7) + 1));
}

export function getMonthFromWeek(weekNumber: number): number {
  return Math.ceil(weekNumber / 4);
}
