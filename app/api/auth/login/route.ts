import { NextResponse } from 'next/server';
import { db, verifyPassword } from '@/database/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      // Generic error message to prevent account enumeration
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const profile = db.getProfile(user.id);
    const { rawToken } = db.createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.fullName || 'Candidate'
      },
      onboardingCompleted: profile?.onboardingCompleted || false,
      onboardingStep: profile?.onboardingStep || 'NAME'
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
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
