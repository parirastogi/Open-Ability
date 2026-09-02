import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/database/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('openability_session')?.value;

    if (token) {
      db.revokeSession(token);
    }

    const response = NextResponse.json({ success: true });
    
    // Clear HttpOnly cookie
    response.cookies.set('openability_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
