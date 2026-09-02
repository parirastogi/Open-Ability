import { NextResponse } from 'next/server';
import { db } from '@/database/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // Create user and atomic initial records
    const { user, profile } = db.createUser(fullName, email, password);

    // Create session
    const { rawToken } = db.createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile.fullName
      },
      onboardingCompleted: profile.onboardingCompleted,
      onboardingStep: profile.onboardingStep
    });

    // Set Secure HttpOnly Session Cookie
    response.cookies.set('openability_session', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed.' }, { status: 400 });
  }
}
