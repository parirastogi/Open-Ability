import { Job, CandidateProfile, AccessibilityProfile, MatchingEngineResult } from '@/types';

export interface MatchingService {
  weights: {
    skills: number;
    experience: number;
    careerGoal: number;
    workPreference: number;
    accessibility: number;
    potential: number;
  };
  calculateMatch(
    candidate: CandidateProfile,
    accessibility: AccessibilityProfile,
    candidateSkills: string[],
    job: Job
  ): MatchingEngineResult;
}

export class DefaultMatchingService implements MatchingService {
  // Configurable weights in one service
  public weights = {
    skills: 0.35,
    experience: 0.20,
    careerGoal: 0.15,
    workPreference: 0.10,
    accessibility: 0.15,
    potential: 0.05
  };

  calculateMatch(
    candidate: CandidateProfile,
    accessibility: AccessibilityProfile,
    candidateSkills: string[],
    job: Job
  ): MatchingEngineResult {
    // 1. Skill Match (0-100)
    const jobSkills = job.skills || [];
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    
    let skillScore = 100;
    const strengths: string[] = [];
    const skillGaps: string[] = [];
    
    if (jobSkills.length > 0) {
      let matchedCount = 0;
      let totalImportance = 0;
      let earnedImportance = 0;
      
      jobSkills.forEach(js => {
        const skillName = js.skill?.name || '';
        const hasSkill = candidateSkillsLower.includes(skillName.toLowerCase());
        const weight = js.importance || 1.0;
        
        totalImportance += weight;
        if (hasSkill) {
          matchedCount++;
          earnedImportance += weight;
          strengths.push(`${skillName} matches a required skill`);
        } else {
          skillGaps.push(skillName);
        }
      });
      
      skillScore = totalImportance > 0 ? (earnedImportance / totalImportance) * 100 : 100;
    } else {
      const descLower = job.description.toLowerCase();
      const matched = candidateSkills.filter(s => descLower.includes(s.toLowerCase()));
      skillScore = candidateSkills.length > 0 ? Math.min(100, (matched.length / Math.max(1, candidateSkills.length)) * 120) : 70;
    }

    // 2. Experience Match (0-100)
    const targetYears = 3;
    const candidateYears = candidate.experienceYears || 0;
    let experienceScore = 100;
    if (candidateYears < targetYears) {
      experienceScore = Math.max(50, 100 - (targetYears - candidateYears) * 15);
      skillGaps.push(`Experience level (${candidateYears} yrs vs job estimate of ${targetYears} yrs)`);
    } else {
      strengths.push(`Your ${candidateYears} years of experience matches required experience`);
    }

    // 3. Career Goal Match (0-100)
    const targetRoles = candidate.targetRoles || [];
    let careerGoalScore = 50;
    const titleLower = job.title.toLowerCase();
    
    const matchesRole = targetRoles.some(role => titleLower.includes(role.toLowerCase()) || role.toLowerCase().includes(titleLower));
    if (matchesRole) {
      careerGoalScore = 100;
      strengths.push(`Job title aligns with your target role of ${targetRoles.join(', ')}`);
    } else {
      careerGoalScore = 75;
      if (titleLower.includes('developer') || titleLower.includes('engineer') || titleLower.includes('designer')) {
        careerGoalScore = 85;
      }
    }

    // 4. Work Preference Match (0-100)
    let workPreferenceScore = 100;
    if (accessibility.workPreference === 'REMOTE' && job.workType !== 'REMOTE') {
      workPreferenceScore = job.workType === 'HYBRID' ? 70 : 40;
    } else if (accessibility.workPreference === 'HYBRID' && job.workType === 'OFFICE') {
      workPreferenceScore = 60;
    } else if (accessibility.workPreference === 'OFFICE' && job.workType === 'REMOTE') {
      workPreferenceScore = 80;
    }
    
    if (workPreferenceScore === 100) {
      strengths.push(`Remote work matches your preference`);
    }

    // 5. Accessibility Compatibility Score (0-100)
    const jobAcc = job.accessibility;
    const compatibilityDetails: { [key: string]: { candidateRequired: boolean; jobSupported: boolean; match: boolean } } = {};
    
    let requiredChecksCount = 0;
    let successfulChecksCount = 0;

    const addCheck = (name: string, candidateRequired: boolean, jobSupported: boolean) => {
      const match = !candidateRequired || jobSupported;
      compatibilityDetails[name] = { candidateRequired, jobSupported, match };
      if (candidateRequired) {
        requiredChecksCount++;
        if (jobSupported) {
          successfulChecksCount++;
        }
      }
    };

    if (jobAcc) {
      addCheck('screenReader', accessibility.screenReaderRequired, jobAcc.screenReaderCompatible);
      addCheck('highContrast', accessibility.highContrastRequired, jobAcc.screenReaderCompatible || jobAcc.assistiveTechnologySupport);
      addCheck('largeText', accessibility.largeTextRequired, jobAcc.screenReaderCompatible);
      addCheck('captions', accessibility.captionsRequired, jobAcc.captionSupport);
      addCheck('textCommunication', accessibility.textCommunicationOnly, jobAcc.textCommunication);
      addCheck('physicalAccessibility', accessibility.accessiblePhysicalSpace, jobAcc.physicalAccessibility);
      addCheck('flexibleHours', accessibility.flexibleHours, jobAcc.flexibleHours);
      addCheck('keyboardNavigation', accessibility.keyboardNavigationOnly, jobAcc.screenReaderCompatible || jobAcc.assistiveTechnologySupport);
    } else {
      ['screenReader', 'highContrast', 'largeText', 'captions', 'textCommunication', 'physicalAccessibility', 'flexibleHours', 'keyboardNavigation'].forEach(check => {
        compatibilityDetails[check] = { candidateRequired: false, jobSupported: true, match: true };
      });
    }

    const accessibilityScore = requiredChecksCount > 0 ? (successfulChecksCount / requiredChecksCount) * 100 : 100;
    
    if (accessibilityScore === 100) {
      strengths.push(`Text communication supported & accessibility accommodations compatible`);
    } else {
      const failedChecks = Object.entries(compatibilityDetails)
        .filter(([_, v]) => v.candidateRequired && !v.jobSupported)
        .map(([k]) => k);
      failedChecks.forEach(check => {
        skillGaps.push(`Accommodations mismatch: Job does not explicitly list support for ${check}`);
      });
    }

    // 6. Potential Match (0-100)
    const potentialScore = Math.min(100, skillScore * 0.7 + careerGoalScore * 0.3 + 10);

    // 7. Overall Score Calculation (Weighted)
    const overallScore = Math.round(
      (skillScore * this.weights.skills) +
      (experienceScore * this.weights.experience) +
      (careerGoalScore * this.weights.careerGoal) +
      (workPreferenceScore * this.weights.workPreference) +
      (accessibilityScore * this.weights.accessibility) +
      (potentialScore * this.weights.potential)
    );

    // Explanation generator
    let explanation = `Match score of ${overallScore}% based on standard evaluation criteria:`;
    explanation += `\n- Technical Skills matching: ${Math.round(skillScore)}%`;
    explanation += `\n- Professional Experience alignment: ${Math.round(experienceScore)}%`;
    explanation += `\n- Career Goal trajectory compatibility: ${Math.round(careerGoalScore)}%`;
    explanation += `\n- Work Preference (remoteness/hours): ${Math.round(workPreferenceScore)}%`;
    explanation += `\n- Workplace Accessibility readiness: ${Math.round(accessibilityScore)}%`;

    const recommendation = overallScore >= 85 
      ? 'Highly Recommended. The candidate represents an outstanding technical and cultural match. Accommodations are fully in place.'
      : overallScore >= 70 
        ? 'Recommended with minor training/accommodations. Candidate exhibits strong core potential, with a few skill or accommodation adjustments needed.'
        : 'Alternative role matching suggested. Strong potential, but alignment with this specific job description requires adjustments.';

    return {
      overallScore,
      skillScore: Math.round(skillScore),
      experienceScore: Math.round(experienceScore),
      careerGoalScore: Math.round(careerGoalScore),
      workPreferenceScore: Math.round(workPreferenceScore),
      accessibilityScore: Math.round(accessibilityScore),
      potentialScore: Math.round(potentialScore),
      strengths,
      skillGaps,
      accessibilityCompatibility: {
        compatible: accessibilityScore >= 80,
        details: compatibilityDetails,
        score: Math.round(accessibilityScore)
      },
      verificationStatus: jobAcc?.verificationStatus || 'VERIFIED',
      explanation,
      recommendation
    };
  }
}

export const matchingService = new DefaultMatchingService();
