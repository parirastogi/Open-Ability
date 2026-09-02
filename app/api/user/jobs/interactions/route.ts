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

  const interactions = db.getJobInteractions(session.user.id);
  return NextResponse.json({ success: true, interactions });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId, interactionType } = body;
    if (!jobId || !interactionType) {
      return NextResponse.json({ error: 'Job ID and interactionType are required.' }, { status: 400 });
    }

    const interaction = db.recordJobInteraction(session.user.id, jobId, interactionType);
    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record job interaction.' }, { status: 400 });
  }
}
