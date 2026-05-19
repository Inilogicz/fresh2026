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

    // Fetch all registrations
    const registrations = await sql`
      SELECT 
        id, 
        ticket_number, 
        name, 
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
        photo,
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const password = searchParams.get('password');

    // Simple security gate
    if (password !== getAdminPassword()) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access. Invalid password.'
      }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing registration ID.'
      }, { status: 400 });
    }

    // Delete registration from database
    await sql`
      DELETE FROM registrations WHERE id = ${parseInt(id)};
    `;

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully!'
    });

  } catch (error: any) {
    console.error('Failed to delete registration:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while deleting registration.'
    }, { status: 500 });
  }
}
