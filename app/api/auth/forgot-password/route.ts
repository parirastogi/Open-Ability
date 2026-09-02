import { NextResponse } from 'next/server';
import { db } from '@/database/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const resetToken = db.createPasswordResetToken(email);

    // Return generic message regardless of email existence to prevent enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email address, password reset instructions have been generated.',
      // For local development convenience:
      devResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
