import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      gender,
      institution,
      status, // 'Staff', 'Student', 'Corper'
      level,
      department,
      member_type, // 'Member', 'Visitor'
      state,
      region,
      center,
      membership_status, // 'member', 'worker', 'Staff'
      denomination,
      location,
      expectations,
      photo, // base64 string
    } = body;

    // 1. Validation
    if (!name || !phone || !email || !gender || !institution || !status || !member_type || !photo) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: Name, Phone, Email, Gender, Institution, Status, Member Type, or Photo is required.'
      }, { status: 400 });
    }

    // Conditional student validations
    if (status === 'Student') {
      if (!level || !department) {
        return NextResponse.json({
          success: false,
          error: 'Students must provide Level and Department.'
        }, { status: 400 });
      }
    }

    // Conditional member/visitor validations
    if (member_type === 'Member') {
      if (!state || !region || !center || !membership_status) {
        return NextResponse.json({
          success: false,
          error: 'Members must provide State, Region, Center, and Membership Status.'
        }, { status: 400 });
      }
    } else if (member_type === 'Visitor') {
      if (!denomination || !location) {
        return NextResponse.json({
          success: false,
          error: 'Visitors must provide Denomination and Location.'
        }, { status: 400 });
      }
    }

    // 2. Generate a unique ticket number (e.g., FR26-X8Y7Z)
    let ticketNumber = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
      ticketNumber = `FR26-${randomString}`;

      // Check if ticket number exists
      const existing = await sql`
        SELECT id FROM registrations WHERE ticket_number = ${ticketNumber} LIMIT 1;
      `;
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate a unique ticket number. Please try again.');
    }

    // 3. Insert into database
    await sql`
      INSERT INTO registrations (
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
        photo
      ) VALUES (
        ${ticketNumber},
        ${name},
        ${phone},
        ${email},
        ${gender},
        ${institution},
        ${status},
        ${status === 'Student' ? level : null},
        ${status === 'Student' ? department : null},
        ${member_type},
        ${member_type === 'Member' ? state : null},
        ${member_type === 'Member' ? region : null},
        ${member_type === 'Member' ? center : null},
        ${member_type === 'Member' ? membership_status : null},
        ${member_type === 'Visitor' ? denomination : null},
        ${member_type === 'Visitor' ? location : null},
        ${expectations || null},
        ${photo}
      );
    `;

    // Fetch the inserted record to verify and return
    const record = await sql`
      SELECT * FROM registrations WHERE ticket_number = ${ticketNumber} LIMIT 1;
    `;

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      registration: record[0]
    });

  } catch (error: any) {
    console.error('Registration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred during registration. Please try again.'
    }, { status: 500 });
  }
}
