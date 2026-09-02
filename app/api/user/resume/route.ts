import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/database/db';
import fs from 'fs';
import path from 'path';

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

  const resumes = db.getUserResumes(session.user.id);
  return NextResponse.json({ success: true, resumes });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, parsedText, structuredAnalysis } = body;

    const storageDir = path.join(process.cwd(), 'storage', 'resumes');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const safeFileName = `${session.user.id}_${Date.now()}_${fileName || 'resume.txt'}`;
    const fileStoragePath = path.join(storageDir, safeFileName);
    fs.writeFileSync(fileStoragePath, parsedText || 'Resume content', 'utf-8');

    const resume = db.addResume(session.user.id, fileName || 'resume.pdf', fileStoragePath, parsedText, structuredAnalysis);

    return NextResponse.json({ success: true, resume });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload/save resume.' }, { status: 400 });
  }
}
