import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Types & Interfaces
export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface DbSession {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
  revokedAt: string | null;
}

export interface DbResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}

export interface DbProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  bio?: string;
  targetRoles: string[];
  experienceYears: number | null;
  education: string;
  onboardingCompleted: boolean;
  onboardingStep: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbAccessibilityProfile {
  id: string;
  userId: string;
  communicationPreference: 'VOICE' | 'TEXT' | 'SIGN_LANGUAGE';
  screenReaderRequired: boolean;
  highContrastRequired: boolean;
  largeTextRequired: boolean;
  captionsRequired: boolean;
  textCommunicationOnly: boolean;
  accessiblePhysicalSpace: boolean;
  workPreference: 'REMOTE' | 'HYBRID' | 'OFFICE';
  flexibleHours: boolean;
  sharingPreferences: boolean; // default false (private)
  accommodations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DbResume {
  id: string;
  userId: string;
  fileName: string;
  fileStoragePath: string;
  parsedText?: string;
  structuredAnalysis?: any;
  uploadedAt: string;
}

export interface DbSkill {
  id: string;
  userId: string;
  name: string;
  category?: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Expert';
  source?: 'USER_INPUT' | 'RESUME_ANALYSIS' | 'ASSISTANT_INFERRED';
  createdAt: string;
}

export interface DbSavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
}

export interface DbJobInteraction {
  id: string;
  userId: string;
  jobId: string;
  interactionType: 'VIEWED' | 'SAVED' | 'SKIPPED' | 'APPLIED';
  createdAt: string;
}

export interface DbInterviewSession {
  id: string;
  userId: string;
  jobId?: string;
  role: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  score?: number;
  feedback?: string;
  startedAt: string;
  endedAt?: string;
  answers: {
    id: string;
    questionText: string;
    candidateAnswerText: string;
    evaluationScore?: number;
    evaluationFeedback?: string;
    answeredAt: string;
  }[];
}

export interface DbCareerProgress {
  id: string;
  userId: string;
  goal: string;
  progress: number;
  status: string;
  updatedAt: string;
}

export interface DbVoicePreferences {
  id: string;
  userId: string;
  voiceLocale: string; // default en-IN
  speechRate: number; // default 0.95
  voiceIndex: number;
  voiceEnabled: boolean;
  updatedAt: string;
}

interface DatabaseSchema {
  users: DbUser[];
  sessions: DbSession[];
  resetTokens: DbResetToken[];
  profiles: DbProfile[];
  accessibilityProfiles: DbAccessibilityProfile[];
  resumes: DbResume[];
  skills: DbSkill[];
  savedJobs: DbSavedJob[];
  jobInteractions: DbJobInteraction[];
  interviewSessions: DbInterviewSession[];
  careerProgress: DbCareerProgress[];
  voicePreferences: DbVoicePreferences[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'database', 'openability_store.json');

// Initialize Store
function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initialDb: DatabaseSchema = {
        users: [],
        sessions: [],
        resetTokens: [],
        profiles: [],
        accessibilityProfiles: [],
        resumes: [],
        skills: [],
        savedJobs: [],
        jobInteractions: [],
        interviewSessions: [],
        careerProgress: [],
        voicePreferences: []
      };
      writeDatabase(initialDb);
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database, creating fresh store:', error);
    return {
      users: [],
      sessions: [],
      resetTokens: [],
      profiles: [],
      accessibilityProfiles: [],
      resumes: [],
      skills: [],
      savedJobs: [],
      jobInteractions: [],
      interviewSessions: [],
      careerProgress: [],
      voicePreferences: []
    };
  }
}

function writeDatabase(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE_PATH);
  } catch (error) {
    console.error('Error writing database:', error);
  }
}

// Password Hashing Security (scrypt with 32-byte salt)
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const hashBuffer = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return { hash: hashBuffer.toString('hex'), salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const hashBuffer = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const computedHash = hashBuffer.toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch (e) {
    return false;
  }
}

// SHA-256 Hash helper for tokens
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

// DAO Abstraction Methods
export const db = {
  // --- AUTH & USERS ---
  createUser(fullName: string, emailRaw: string, passwordRaw: string): { user: DbUser; profile: DbProfile } {
    const email = emailRaw.toLowerCase().trim();
    const store = readDatabase();

    // Check unique normalized email constraint
    if (store.users.some(u => u.email === email)) {
      throw new Error('An account already exists with this email address.');
    }

    const userId = generateUUID();
    const now = new Date().toISOString();
    const { hash, salt } = hashPassword(passwordRaw);

    const newUser: DbUser = {
      id: userId,
      email,
      passwordHash: hash,
      salt,
      role: 'CANDIDATE',
      createdAt: now,
      updatedAt: now
    };

    const newProfile: DbProfile = {
      id: generateUUID(),
      userId,
      fullName: fullName.trim(),
      targetRoles: [],
      experienceYears: null,
      education: '',
      onboardingCompleted: false,
      onboardingStep: 'NAME',
      createdAt: now,
      updatedAt: now
    };

    const newAccProfile: DbAccessibilityProfile = {
      id: generateUUID(),
      userId,
      communicationPreference: 'VOICE',
      screenReaderRequired: false,
      highContrastRequired: false,
      largeTextRequired: false,
      captionsRequired: false,
      textCommunicationOnly: false,
      accessiblePhysicalSpace: false,
      workPreference: 'REMOTE',
      flexibleHours: false,
      sharingPreferences: false, // private by default
      accommodations: [],
      createdAt: now,
      updatedAt: now
    };

    const newVoicePrefs: DbVoicePreferences = {
      id: generateUUID(),
      userId,
      voiceLocale: 'en-IN',
      speechRate: 0.95,
      voiceIndex: 0,
      voiceEnabled: true,
      updatedAt: now
    };

    // Atomic Transaction insertion
    store.users.push(newUser);
    store.profiles.push(newProfile);
    store.accessibilityProfiles.push(newAccProfile);
    store.voicePreferences.push(newVoicePrefs);

    writeDatabase(store);
    return { user: newUser, profile: newProfile };
  },

  findUserByEmail(emailRaw: string): DbUser | null {
    const email = emailRaw.toLowerCase().trim();
    const store = readDatabase();
    return store.users.find(u => u.email === email) || null;
  },

  findUserById(userId: string): DbUser | null {
    const store = readDatabase();
    return store.users.find(u => u.id === userId) || null;
  },

  // --- SESSIONS ---
  createSession(userId: string): { rawToken: string; session: DbSession } {
    const store = readDatabase();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiration

    const session: DbSession = {
      id: generateUUID(),
      userId,
      tokenHash,
      createdAt: now.toISOString(),
      expiresAt,
      lastUsedAt: now.toISOString(),
      revokedAt: null
    };

    store.sessions.push(session);
    writeDatabase(store);
    return { rawToken, session };
  },

  validateSession(rawToken: string): { user: DbUser; profile: DbProfile } | null {
    if (!rawToken) return null;
    const tokenHash = hashToken(rawToken);
    const store = readDatabase();

    const session = store.sessions.find(s => s.tokenHash === tokenHash && s.revokedAt === null);
    if (!session) return null;

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    const user = store.users.find(u => u.id === session.userId);
    if (!user) return null;

    const profile = store.profiles.find(p => p.userId === user.id);
    if (!profile) return null;

    // Refresh lastUsedAt
    session.lastUsedAt = new Date().toISOString();
    writeDatabase(store);

    return { user, profile };
  },

  revokeSession(rawToken: string): void {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    const store = readDatabase();
    const session = store.sessions.find(s => s.tokenHash === tokenHash);
    if (session) {
      session.revokedAt = new Date().toISOString();
      writeDatabase(store);
    }
  },

  revokeAllUserSessions(userId: string): void {
    const store = readDatabase();
    const now = new Date().toISOString();
    let updated = false;
    store.sessions.forEach(s => {
      if (s.userId === userId && s.revokedAt === null) {
        s.revokedAt = now;
        updated = true;
      }
    });
    if (updated) writeDatabase(store);
  },

  // --- PASSWORD RESET ---
  createPasswordResetToken(emailRaw: string): string | null {
    const user = this.findUserByEmail(emailRaw);
    if (!user) return null;

    const store = readDatabase();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour

    const resetToken: DbResetToken = {
      id: generateUUID(),
      userId: user.id,
      tokenHash,
      createdAt: now.toISOString(),
      expiresAt,
      usedAt: null
    };

    store.resetTokens.push(resetToken);
    writeDatabase(store);
    return rawToken;
  },

  resetPasswordWithToken(rawToken: string, newPasswordRaw: string): boolean {
    const tokenHash = hashToken(rawToken);
    const store = readDatabase();
    const tokenRecord = store.resetTokens.find(t => t.tokenHash === tokenHash && t.usedAt === null);

    if (!tokenRecord || new Date(tokenRecord.expiresAt) < new Date()) {
      return false;
    }

    const user = store.users.find(u => u.id === tokenRecord.userId);
    if (!user) return false;

    // Update password
    const { hash, salt } = hashPassword(newPasswordRaw);
    user.passwordHash = hash;
    user.salt = salt;
    user.updatedAt = new Date().toISOString();
    tokenRecord.usedAt = new Date().toISOString();

    // Revoke all existing active sessions upon password reset
    store.sessions.forEach(s => {
      if (s.userId === user.id) s.revokedAt = new Date().toISOString();
    });

    writeDatabase(store);
    return true;
  },

  updatePasswordForUser(userId: string, oldPasswordRaw: string, newPasswordRaw: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    if (!verifyPassword(oldPasswordRaw, user.passwordHash, user.salt)) {
      return false;
    }

    const store = readDatabase();
    const userInDb = store.users.find(u => u.id === userId);
    if (!userInDb) return false;

    const { hash, salt } = hashPassword(newPasswordRaw);
    userInDb.passwordHash = hash;
    userInDb.salt = salt;
    userInDb.updatedAt = new Date().toISOString();

    // Revoke all existing active sessions
    store.sessions.forEach(s => {
      if (s.userId === userId) s.revokedAt = new Date().toISOString();
    });

    writeDatabase(store);
    return true;
  },

  // --- PROFILES ---
  getProfile(userId: string): DbProfile | null {
    const store = readDatabase();
    return store.profiles.find(p => p.userId === userId) || null;
  },

  updateProfile(userId: string, data: Partial<DbProfile>): DbProfile {
    const store = readDatabase();
    let profile = store.profiles.find(p => p.userId === userId);
    const now = new Date().toISOString();

    if (!profile) {
      profile = {
        id: generateUUID(),
        userId,
        fullName: data.fullName || 'Candidate',
        targetRoles: data.targetRoles || [],
        experienceYears: data.experienceYears !== undefined ? data.experienceYears : null,
        education: data.education || '',
        onboardingCompleted: data.onboardingCompleted || false,
        onboardingStep: data.onboardingStep || 'NAME',
        createdAt: now,
        updatedAt: now
      };
      store.profiles.push(profile);
    } else {
      if (data.fullName !== undefined) profile.fullName = data.fullName;
      if (data.phone !== undefined) profile.phone = data.phone;
      if (data.bio !== undefined) profile.bio = data.bio;
      if (data.targetRoles !== undefined) profile.targetRoles = data.targetRoles;
      if (data.experienceYears !== undefined) profile.experienceYears = data.experienceYears;
      if (data.education !== undefined) profile.education = data.education;
      if (data.onboardingCompleted !== undefined) profile.onboardingCompleted = data.onboardingCompleted;
      if (data.onboardingStep !== undefined) profile.onboardingStep = data.onboardingStep;
      profile.updatedAt = now;
    }

    writeDatabase(store);
    return profile;
  },

  // --- ACCESSIBILITY PROFILES ---
  getAccessibilityProfile(userId: string): DbAccessibilityProfile | null {
    const store = readDatabase();
    return store.accessibilityProfiles.find(a => a.userId === userId) || null;
  },

  updateAccessibilityProfile(userId: string, data: Partial<DbAccessibilityProfile>): DbAccessibilityProfile {
    const store = readDatabase();
    let acc = store.accessibilityProfiles.find(a => a.userId === userId);
    const now = new Date().toISOString();

    if (!acc) {
      acc = {
        id: generateUUID(),
        userId,
        communicationPreference: data.communicationPreference || 'VOICE',
        screenReaderRequired: data.screenReaderRequired || false,
        highContrastRequired: data.highContrastRequired || false,
        largeTextRequired: data.largeTextRequired || false,
        captionsRequired: data.captionsRequired || false,
        textCommunicationOnly: data.textCommunicationOnly || false,
        accessiblePhysicalSpace: data.accessiblePhysicalSpace || false,
        workPreference: data.workPreference || 'REMOTE',
        flexibleHours: data.flexibleHours || false,
        sharingPreferences: data.sharingPreferences || false,
        accommodations: data.accommodations || [],
        createdAt: now,
        updatedAt: now
      };
      store.accessibilityProfiles.push(acc);
    } else {
      Object.assign(acc, data, { updatedAt: now });
    }

    writeDatabase(store);
    return acc;
  },

  // --- RESUMES ---
  getUserResumes(userId: string): DbResume[] {
    const store = readDatabase();
    return store.resumes.filter(r => r.userId === userId);
  },

  addResume(userId: string, fileName: string, fileStoragePath: string, parsedText?: string, structuredAnalysis?: any): DbResume {
    const store = readDatabase();
    const resume: DbResume = {
      id: generateUUID(),
      userId,
      fileName,
      fileStoragePath,
      parsedText,
      structuredAnalysis,
      uploadedAt: new Date().toISOString()
    };
    store.resumes.push(resume);
    writeDatabase(store);
    return resume;
  },

  // --- SKILLS ---
  getUserSkills(userId: string): DbSkill[] {
    const store = readDatabase();
    return store.skills.filter(s => s.userId === userId);
  },

  addUserSkill(userId: string, name: string, category?: string, proficiency?: 'Beginner' | 'Intermediate' | 'Expert', source?: 'USER_INPUT' | 'RESUME_ANALYSIS' | 'ASSISTANT_INFERRED'): DbSkill {
    const store = readDatabase();
    const existing = store.skills.find(s => s.userId === userId && s.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const skill: DbSkill = {
      id: generateUUID(),
      userId,
      name: name.trim(),
      category,
      proficiency: proficiency || 'Intermediate',
      source: source || 'USER_INPUT',
      createdAt: new Date().toISOString()
    };
    store.skills.push(skill);
    writeDatabase(store);
    return skill;
  },

  // --- SAVED JOBS & INTERACTIONS ---
  getSavedJobs(userId: string): DbSavedJob[] {
    const store = readDatabase();
    return store.savedJobs.filter(j => j.userId === userId);
  },

  saveJob(userId: string, jobId: string): DbSavedJob {
    const store = readDatabase();
    const existing = store.savedJobs.find(j => j.userId === userId && j.jobId === jobId);
    if (existing) return existing;

    const saved: DbSavedJob = {
      id: generateUUID(),
      userId,
      jobId,
      savedAt: new Date().toISOString()
    };
    store.savedJobs.push(saved);
    writeDatabase(store);
    return saved;
  },

  removeSavedJob(userId: string, jobId: string): void {
    const store = readDatabase();
    store.savedJobs = store.savedJobs.filter(j => !(j.userId === userId && j.jobId === jobId));
    writeDatabase(store);
  },

  getJobInteractions(userId: string): DbJobInteraction[] {
    const store = readDatabase();
    return store.jobInteractions.filter(i => i.userId === userId);
  },

  recordJobInteraction(userId: string, jobId: string, interactionType: 'VIEWED' | 'SAVED' | 'SKIPPED' | 'APPLIED'): DbJobInteraction {
    const store = readDatabase();
    const interaction: DbJobInteraction = {
      id: generateUUID(),
      userId,
      jobId,
      interactionType,
      createdAt: new Date().toISOString()
    };
    store.jobInteractions.push(interaction);
    writeDatabase(store);
    return interaction;
  },

  // --- INTERVIEW SESSIONS ---
  getInterviewSessions(userId: string): DbInterviewSession[] {
    const store = readDatabase();
    return store.interviewSessions.filter(i => i.userId === userId);
  },

  createInterviewSession(userId: string, role: string, jobId?: string): DbInterviewSession {
    const store = readDatabase();
    const session: DbInterviewSession = {
      id: generateUUID(),
      userId,
      jobId,
      role,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      answers: []
    };
    store.interviewSessions.push(session);
    writeDatabase(store);
    return session;
  },

  addInterviewAnswer(userId: string, sessionId: string, questionText: string, candidateAnswerText: string, evaluationScore?: number, evaluationFeedback?: string) {
    const store = readDatabase();
    const session = store.interviewSessions.find(i => i.id === sessionId && i.userId === userId);
    if (!session) throw new Error('Interview session not found or unauthorized.');

    const answer = {
      id: generateUUID(),
      questionText,
      candidateAnswerText,
      evaluationScore,
      evaluationFeedback,
      answeredAt: new Date().toISOString()
    };

    session.answers.push(answer);
    writeDatabase(store);
    return answer;
  },

  // --- CAREER PROGRESS ---
  getCareerProgress(userId: string): DbCareerProgress | null {
    const store = readDatabase();
    return store.careerProgress.find(c => c.userId === userId) || null;
  },

  updateCareerProgress(userId: string, goal: string, progress: number, status: string): DbCareerProgress {
    const store = readDatabase();
    let cp = store.careerProgress.find(c => c.userId === userId);
    const now = new Date().toISOString();

    if (!cp) {
      cp = {
        id: generateUUID(),
        userId,
        goal,
        progress,
        status,
        updatedAt: now
      };
      store.careerProgress.push(cp);
    } else {
      cp.goal = goal;
      cp.progress = progress;
      cp.status = status;
      cp.updatedAt = now;
    }

    writeDatabase(store);
    return cp;
  },

  // --- VOICE PREFERENCES ---
  getVoicePreferences(userId: string): DbVoicePreferences | null {
    const store = readDatabase();
    return store.voicePreferences.find(v => v.userId === userId) || null;
  },

  updateVoicePreferences(userId: string, prefs: Partial<DbVoicePreferences>): DbVoicePreferences {
    const store = readDatabase();
    let vp = store.voicePreferences.find(v => v.userId === userId);
    const now = new Date().toISOString();

    if (!vp) {
      vp = {
        id: generateUUID(),
        userId,
        voiceLocale: prefs.voiceLocale || 'en-IN',
        speechRate: prefs.speechRate || 0.95,
        voiceIndex: prefs.voiceIndex || 0,
        voiceEnabled: prefs.voiceEnabled !== undefined ? prefs.voiceEnabled : true,
        updatedAt: now
      };
      store.voicePreferences.push(vp);
    } else {
      Object.assign(vp, prefs, { updatedAt: now });
    }

    writeDatabase(store);
    return vp;
  }
};
