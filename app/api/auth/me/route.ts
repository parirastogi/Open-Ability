import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/database/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('openability_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const sessionData = db.validateSession(token);
    if (!sessionData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { user, profile } = sessionData;
    const accessibility = db.getAccessibilityProfile(user.id);
    const voicePreferences = db.getVoicePreferences(user.id);
    const skills = db.getUserSkills(user.id).map(s => s.name);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile.fullName
      },
      profile: {
        fullName: profile.fullName,
        phone: profile.phone || '',
        bio: profile.bio || '',
        targetRoles: profile.targetRoles || [],
        experienceYears: profile.experienceYears || 0,
        education: profile.education || '',
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep
      },
      accessibility: accessibility || {
        communicationPreference: 'VOICE',
        screenReaderRequired: false,
        captionsRequired: false,
        textCommunicationOnly: false,
        workPreference: 'REMOTE',
        sharingPreferences: false,
        accommodations: []
      },
      voicePreferences: voicePreferences || {
        voiceLocale: 'en-IN',
        speechRate: 0.95,
        voiceIndex: 0,
        voiceEnabled: true
      },
      skills
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
