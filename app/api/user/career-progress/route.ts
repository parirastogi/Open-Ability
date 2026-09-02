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

  const progress = db.getCareerProgress(session.user.id);
  return NextResponse.json({ success: true, progress });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { goal, progress, status } = body;

    const updated = db.updateCareerProgress(session.user.id, goal || 'Career Goal', progress || 0, status || 'IN_PROGRESS');
    return NextResponse.json({ success: true, progress: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update career progress.' }, { status: 400 });
  }
}
