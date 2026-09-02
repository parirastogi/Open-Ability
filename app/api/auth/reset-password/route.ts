import { NextResponse } from 'next/server';
import { db } from '@/database/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const success = db.resetPasswordWithToken(token, newPassword);
    if (!success) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
