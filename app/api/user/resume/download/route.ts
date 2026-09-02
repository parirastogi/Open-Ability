import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/database/db';
import fs from 'fs';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('openability_session')?.value;
  if (!token) return null;
  return db.validateSession(token);
}

export async function GET(request: Request) {
  const session = await getAuthenticatedUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get('id');

  if (!resumeId) {
    return NextResponse.json({ error: 'Resume ID is required.' }, { status: 400 });
  }

  const userResumes = db.getUserResumes(session.user.id);
  const targetResume = userResumes.find(r => r.id === resumeId);

  if (!targetResume) {
    // Rejects cross-user unauthorized access attempts with 403 Forbidden
    return NextResponse.json({ error: 'Forbidden: You do not own this resume.' }, { status: 403 });
  }

  if (!fs.existsSync(targetResume.fileStoragePath)) {
    return NextResponse.json({ error: 'File not found on server.' }, { status: 404 });
  }

  const fileContent = fs.readFileSync(targetResume.fileStoragePath, 'utf-8');
  return new NextResponse(fileContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${targetResume.fileName}"`
    }
  });
}
