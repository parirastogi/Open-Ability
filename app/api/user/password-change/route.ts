import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/database/db';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('openability_session')?.value;
  if (!token) return null;
  return db.validateSession(token);
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Old password and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const success = db.updatePasswordForUser(session.user.id, oldPassword, newPassword);
    if (!success) {
      return NextResponse.json({ error: 'Old password is incorrect.' }, { status: 400 });
    }

    // Generate a fresh session for current client
    const { rawToken } = db.createSession(session.user.id);
    const response = NextResponse.json({ success: true, message: 'Password changed successfully. All other active sessions have been revoked.' });

    response.cookies.set('openability_session', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}
