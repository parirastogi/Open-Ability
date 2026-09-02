export type CommPreference = 'VOICE' | 'TEXT' | 'SIGN_LANGUAGE';
export type WorkPreference = 'REMOTE' | 'HYBRID' | 'OFFICE';
export type VerificationConfidence = 'VERIFIED' | 'EMPLOYER_REPORTED' | 'CANDIDATE_REPORTED' | 'INFERRED' | 'UNKNOWN';

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  bio?: string;
  targetRoles: string[];
  experienceYears?: number;
  education?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessibilityProfile {
  id: string;
  candidateProfileId: string;
  communicationPreference: CommPreference;
  screenReaderRequired: boolean;
  highContrastRequired: boolean;
  largeTextRequired: boolean;
  captionsRequired: boolean;
  textCommunicationOnly: boolean;
  accessiblePhysicalSpace: boolean;
  workPreference: WorkPreference;
  flexibleHours: boolean;
  keyboardNavigationOnly: boolean;
  assistiveTechDetail?: string;
  accommodations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface Resume {
  id: string;
  candidateProfileId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: Date;
  parsedText?: string;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  summary: string;
  experienceYears: number;
  parsedSkills: string[];
  rawAnalysis: any;
  analyzedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  salaryRange?: string;
  workType: WorkPreference;
  createdAt: Date;
  updatedAt: Date;
  skills?: JobSkill[];
  accessibility?: JobAccessibility;
}

export interface JobSkill {
  id: string;
  jobId: string;
  skillId: string;
  skill?: Skill;
  isRequired: boolean;
  importance: number; // 1.0 = normal, 2.0 = critical, etc.
}

export interface JobAccessibility {
  id: string;
  jobId: string;
  remoteAvailable: boolean;
  flexibleHours: boolean;
  screenReaderCompatible: boolean;
  captionSupport: boolean;
  textCommunication: boolean;
  accessibleInterview: boolean;
  physicalAccessibility: boolean;
  assistiveTechnologySupport: boolean;
  readinessScore: number;
  verificationStatus?: VerificationConfidence;
  wheelchairEntrance?: boolean;
  accessibleRestrooms?: boolean;
  accessibleParking?: boolean;
  elevatorAccess?: boolean;
  transitProximity?: string;
  notes?: string;
}

export interface MatchingEngineResult {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  careerGoalScore: number;
  workPreferenceScore: number;
  accessibilityScore: number;
  potentialScore: number;
  strengths: string[];
  skillGaps: string[];
  accessibilityCompatibility: {
    compatible: boolean;
    details: { [key: string]: { candidateRequired: boolean; jobSupported: boolean; match: boolean } };
    score: number;
  };
  verificationStatus?: VerificationConfidence;
  explanation: string;
  recommendation: string;
}

export interface JobMatch extends MatchingEngineResult {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job?: Job;
  matchedAt: Date;
}

export interface InterviewSession {
  id: string;
  candidateProfileId: string;
  jobId: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'EVALUATED';
  startedAt?: Date;
  endedAt?: Date;
  feedback?: string;
  score?: number;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  questionText: string;
  context?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  candidateAnswerText: string;
  audioUrl?: string;
  transcription?: string;
  evaluationScore?: number;
  evaluationFeedback?: string;
  answeredAt: Date;
}

export interface CareerRecommendation {
  id: string;
  candidateProfileId: string;
  roleTitle: string;
  averageSalary?: string;
  skillGaps: string[];
  learningPath: {
    courses: string[];
    certifications: string[];
    timeline: string;
  };
  marketDemand: 'HIGH' | 'MEDIUM' | 'LOW';
  matchExplanation: string;
  recommendedAt: Date;
}

export interface PostHiringAccommodation {
  id: string;
  candidateProfileId: string;
  title: string;
  category: 'ASSISTIVE_TECH' | 'PHYSICAL_SPACE' | 'FLEXIBLE_WORK' | 'COMMUNICATION';
  status: 'REQUESTED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  details: string;
  requestedAt: string;
}

export interface AccessibilityFeedback {
  id: string;
  jobId: string;
  candidateProfileId: string;
  type: 'APPLICATION' | 'INTERVIEW' | 'WORKPLACE';
  rating: number; // 1 to 5
  feedbackText: string;
  submittedAt: string;
}

export interface BiasAuditLog {
  id: string;
  jobId: string;
  scoreBeforeAudit: number;
  scoreAfterAudit: number;
  disabilityPenaltyDetected: boolean;
  auditNotes: string;
  auditedAt: string;
}

export type AgentType = 
  | 'RESUME'
  | 'SKILLS'
  | 'CAREER'
  | 'JOB_MATCH'
  | 'ACCESSIBILITY'
  | 'EMPLOYER_READINESS'
  | 'INTERVIEW'
  | 'BIAS_AUDIT'
  | 'ORCHESTRATOR';

