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

  const sessions = db.getInterviewSessions(session.user.id);
  return NextResponse.json({ success: true, sessions });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // New Session Creation vs Answer Recording
    if (body.action === 'CREATE_SESSION') {
      const { role, jobId } = body;
      const interviewSession = db.createInterviewSession(session.user.id, role || 'Software Developer', jobId);
      return NextResponse.json({ success: true, session: interviewSession });
    }

    if (body.action === 'ADD_ANSWER') {
      const { sessionId, questionText, candidateAnswerText, evaluationScore, evaluationFeedback } = body;
      const answer = db.addInterviewAnswer(session.user.id, sessionId, questionText, candidateAnswerText, evaluationScore, evaluationFeedback);
      return NextResponse.json({ success: true, answer });
    }

    return NextResponse.json({ error: 'Invalid interview action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process interview data.' }, { status: 400 });
  }
}
