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

  const skills = db.getUserSkills(session.user.id);
  return NextResponse.json({ success: true, skills });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, category, proficiency, source } = body;
    if (!name) return NextResponse.json({ error: 'Skill name required.' }, { status: 400 });

    const skill = db.addUserSkill(session.user.id, name, category, proficiency, source);
    return NextResponse.json({ success: true, skill });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add skill.' }, { status: 400 });
  }
}
