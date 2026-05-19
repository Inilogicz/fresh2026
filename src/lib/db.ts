import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('Please define the DATABASE_URL environment variable in .env.local');
}

export const sql = neon(process.env.DATABASE_URL);
