import { Job, JobAccessibility } from '@/types';

export interface JobsService {
  getJobs(): Promise<Job[]>;
  getJobById(id: string): Promise<Job | null>;
  calculateReadinessScore(accessibility: Omit<JobAccessibility, 'id' | 'jobId'>): number;
}

export class MockJobsService implements JobsService {
  private jobs: Job[] = [];

  constructor() {
    // We will initialize jobs with mock seed data in a later step, or keep a basic list here
  }

  async getJobs(): Promise<Job[]> {
    return this.jobs;
  }

  async getJobById(id: string): Promise<Job | null> {
    return this.jobs.find(j => j.id === id) || null;
  }

  calculateReadinessScore(acc: Omit<JobAccessibility, 'id' | 'jobId'>): number {
    // Accessibility Readiness Score calculation based on supported features:
    // remoteAvailable (15%), flexibleHours (15%), screenReaderCompatible (15%), 
    // captionSupport (15%), textCommunication (10%), accessibleInterview (10%), 
    // physicalAccessibility (10%), assistiveTechnologySupport (10%)
    let score = 0;
    if (acc.remoteAvailable) score += 15;
    if (acc.flexibleHours) score += 15;
    if (acc.screenReaderCompatible) score += 15;
    if (acc.captionSupport) score += 15;
    if (acc.textCommunication) score += 10;
    if (acc.accessibleInterview) score += 10;
    if (acc.physicalAccessibility) score += 10;
    if (acc.assistiveTechnologySupport) score += 10;
    return score;
  }

  setMockJobs(jobs: Job[]) {
    this.jobs = jobs;
  }
}

export const jobsService = new MockJobsService();
