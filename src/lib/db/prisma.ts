import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/ai_learning_agent';

// Enable SSL when connecting to cloud Postgres (Supabase) or in production
const requiresSSL = connectionString.includes('supabase.co') || 
                    connectionString.includes('supabase.com') || 
                    process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ssl: requiresSSL ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
