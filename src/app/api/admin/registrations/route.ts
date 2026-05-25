import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const getAdminPassword = () => process.env.ADMIN_PASSWORD || 'fresh2026admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    // Simple security gate
    if (password !== getAdminPassword()) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access. Invalid password.'
      }, { status: 401 });
    }

    const id = searchParams.get('id');

    if (id) {
      // Fetch only the photo for the specified registration record
      const result = await sql`
        SELECT photo FROM registrations WHERE id = ${id};
      `;
      if (result.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Registration record not found.'
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        photo: result[0].photo
      });
    }

    // Fetch all registrations (excluding photo to keep payload lightweight)
    const registrations = await sql`
      SELECT 
        id, 
        ticket_number, 
        name, 
        phone,
        email,
        gender, 
        institution, 
        status, 
        level, 
        department, 
        member_type, 
        state, 
        region, 
        center, 
        membership_status, 
        denomination, 
        location, 
        expectations, 
        created_at 
      FROM registrations 
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({
      success: true,
      registrations
    });

  } catch (error: any) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching registrations.'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  return NextResponse.json({
    success: false,
    error: 'Record deletion has been permanently disabled in production for security and data integrity.'
  }, { status: 405 });
}
