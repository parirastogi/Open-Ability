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

  const voicePreferences = db.getVoicePreferences(session.user.id);
  return NextResponse.json({ success: true, voicePreferences });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = db.updateVoicePreferences(session.user.id, body);
    return NextResponse.json({ success: true, voicePreferences: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update voice preferences.' }, { status: 400 });
  }
}
