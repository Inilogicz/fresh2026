import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Create registrations table if it doesn't exist using template literals
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        level VARCHAR(50),
        department VARCHAR(255),
        member_type VARCHAR(50) NOT NULL,
        state VARCHAR(100),
        region VARCHAR(100),
        center VARCHAR(100),
        membership_status VARCHAR(50),
        denomination VARCHAR(255),
        location VARCHAR(255),
        expectations TEXT,
        photo TEXT NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Alter table in case it already exists to add phone and email columns
    await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;
    await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email VARCHAR(255);`;

    // Verify connection by fetching table count
    const countResult = await sql`SELECT COUNT(*) FROM registrations;`;
    
    return NextResponse.json({
      success: true,
      message: 'Database setup successfully completed!',
      count: countResult[0]?.count || 0
    });
  } catch (error: any) {
    console.error('Database setup failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown database error'
    }, { status: 500 });
  }
}
