import { resumeAgent } from './agents/resumeAgent';
import { skillsAgent } from './agents/skillsAgent';
import { careerAgent } from './agents/careerAgent';
import { biasAuditAgent } from './agents/biasAuditAgent';
import { interviewAgent } from './agents/interviewAgent';
import { AgentType } from '@/types';

export interface OrchestrationResult {
  activeAgent: AgentType;
  query: string;
  response: string;
  data?: any;
  auditPassed?: boolean;
}

export class AgenticCareerOrchestrator {
  async routeAndExecute(query: string, context: any): Promise<OrchestrationResult> {
    const qLower = query.toLowerCase().trim();
    const hasProfile = Boolean(context.fullName || (context.skills && context.skills.length > 0));

    // 1. Resume Agent Route
    if (qLower.includes('resume') || qLower.includes('cv') || qLower.includes('parse')) {
      const resumeText = context.resumeText || context.bio || '';
      if (!resumeText) {
        return {
          activeAgent: 'RESUME',
          query,
          response: "I don't have your resume or project details yet. Would you like to upload your resume, or create your profile by voice?",
          data: { missingData: true }
        };
      }
      const analysis = await resumeAgent.process(resumeText, context.targetRole);
      return {
        activeAgent: 'RESUME',
        query,
        response: `[Resume Agent] ${analysis.summary} Key improvements: ${analysis.improvements.join(' ')}`,
        data: analysis
      };
    }

    // 2. Skills Agent Route
    if (qLower.includes('skill') || qLower.includes('gap') || qLower.includes('missing') || qLower.includes('learn')) {
      const skills = context.skills || [];
      if (skills.length === 0) {
        return {
          activeAgent: 'SKILLS',
          query,
          response: "I don't have your skills listed yet. Would you like to tell me what skills or tools you know?",
          data: { missingData: true }
        };
      }
      const targetRole = context.targetRole || (context.targetRoles && context.targetRoles[0]) || 'Software Developer';
      const gapAnalysis = await skillsAgent.analyzeGaps(skills, targetRole);
      return {
        activeAgent: 'SKILLS',
        query,
        response: `[Skills Agent] Match for ${targetRole}: ${gapAnalysis.matchPercentage}%. Missing skills to focus on: ${gapAnalysis.missingSkills.join(', ') || 'None! You match fully.'}`,
        data: gapAnalysis
      };
    }

    // 3. Interview Agent Route
    if (qLower.includes('interview') || qLower.includes('practice') || qLower.includes('mock')) {
      const targetRole = (context.targetRoles && context.targetRoles[0]) || context.targetRole || 'Software Developer';
      const questions = await interviewAgent.generateQuestions(targetRole, 3);
      return {
        activeAgent: 'INTERVIEW',
        query,
        response: `[Interview Agent] Prepared ${questions.length} accessible practice questions for ${targetRole}. Question 1: "${questions[0]}". Say 'Start mock interview' when ready to answer by voice.`,
        data: { questions }
      };
    }

    // 4. Career Agent Route
    if (qLower.includes('career') || qLower.includes('growth') || qLower.includes('future') || qLower.includes('path')) {
      if (!hasProfile) {
        return {
          activeAgent: 'CAREER',
          query,
          response: "I don't have your career goals or background yet. Say 'Start onboarding' or tell me what role interests you.",
          data: { missingData: true }
        };
      }
      const recs = await careerAgent.generateCareerAdvice(context);
      return {
        activeAgent: 'CAREER',
        query,
        response: `[Career Agent] Recommended target role: ${recs[0]?.roleTitle}. Estimated salary range: ${recs[0]?.averageSalary}. Learning timeline: ${recs[0]?.learningPath.timeline}.`,
        data: recs
      };
    }

    // 5. General / Bias Audit Agent Fallback
    if (!hasProfile) {
      return {
        activeAgent: 'ORCHESTRATOR',
        query,
        response: "Welcome to OpenAbility! I don't have your career information yet. You can say 'Start onboarding' to set up your profile through voice, or ask me any question.",
        data: { missingData: true }
      };
    }

    const candidateAccommodations = context.accommodations || [];
    const audit = await biasAuditAgent.auditMatchingResult('job-0', 90, candidateAccommodations);

    return {
      activeAgent: 'ORCHESTRATOR',
      query,
      response: `Hello ${context.fullName}! How can I assist your career journey today? You can ask me to find jobs, analyze your resume, or start interview preparation.`,
      data: { audit },
      auditPassed: !audit.disabilityPenaltyDetected
    };
  }
}

export const orchestrator = new AgenticCareerOrchestrator();
