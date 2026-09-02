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

  const savedJobs = db.getSavedJobs(session.user.id);
  return NextResponse.json({ success: true, savedJobs });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId } = body;
    if (!jobId) return NextResponse.json({ error: 'Job ID required.' }, { status: 400 });

    const saved = db.saveJob(session.user.id, jobId);
    db.recordJobInteraction(session.user.id, jobId, 'SAVED');
    return NextResponse.json({ success: true, saved });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save job.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'Job ID required.' }, { status: 400 });

    db.removeSavedJob(session.user.id, jobId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove saved job.' }, { status: 400 });
  }
}
