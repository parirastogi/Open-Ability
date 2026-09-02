import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/database/db';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('openability_session')?.value;
  if (!token) return null;
  return db.validateSession(token);
}

export async function GET() {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = db.getProfile(session.user.id);
  return NextResponse.json({ success: true, profile });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updatedProfile = db.updateProfile(session.user.id, body);
    
    // Also save skills if passed
    if (Array.isArray(body.skills)) {
      body.skills.forEach((s: string) => {
        if (s && typeof s === 'string') {
          db.addUserSkill(session.user.id, s, undefined, undefined, 'USER_INPUT');
        }
      });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile.' }, { status: 400 });
  }
}
