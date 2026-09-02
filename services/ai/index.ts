import { ResumeAnalysis } from '@/types';
import { resumeAgent } from './agents/resumeAgent';
import { careerAgent } from './agents/careerAgent';
import { interviewAgent } from './agents/interviewAgent';
import { orchestrator } from './orchestrator';

export interface AIService {
  analyzeResume(resumeText: string): Promise<Omit<ResumeAnalysis, 'id' | 'resumeId' | 'analyzedAt'>>;
  generateCareerAdvice(candidateContext: any): Promise<string>;
  evaluateInterviewAnswer(questionText: string, answerText: string): Promise<{ score: number; feedback: string }>;
  generateInterviewQuestions(roleTitle: string, count: number): Promise<string[]>;
  chatWithAssistant(message: string, candidateContext: any, chatHistory: { role: 'user' | 'assistant'; content: string }[]): Promise<string>;
}

export class AgenticAIService implements AIService {
  async analyzeResume(resumeText: string): Promise<Omit<ResumeAnalysis, 'id' | 'resumeId' | 'analyzedAt'>> {
    const res = await resumeAgent.process(resumeText);
    return {
      summary: res.summary,
      experienceYears: res.experienceYears,
      parsedSkills: res.parsedSkills,
      rawAnalysis: res.rawAnalysis
    };
  }

  async generateCareerAdvice(candidateContext: any): Promise<string> {
    const recs = await careerAgent.generateCareerAdvice(candidateContext);
    const top = recs[0];
    return `Based on target role (${top.roleTitle}) and your skill profile, we recommend:
1. Courses: ${top.learningPath.courses.join(', ')}
2. Timeline: ${top.learningPath.timeline}
3. Focus area: Deepening WCAG & ARIA accessibility patterns.`;
  }

  async evaluateInterviewAnswer(questionText: string, answerText: string): Promise<{ score: number; feedback: string }> {
    const evalRes = await interviewAgent.evaluateAnswer(questionText, answerText);
    return {
      score: evalRes.score,
      feedback: evalRes.feedback
    };
  }

  async generateInterviewQuestions(roleTitle: string, count: number): Promise<string[]> {
    return interviewAgent.generateQuestions(roleTitle, count);
  }

  async chatWithAssistant(
    message: string, 
    candidateContext: any, 
    chatHistory: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<string> {
    const orchestration = await orchestrator.routeAndExecute(message, candidateContext);
    return orchestration.response;
  }
}

export const aiService = new AgenticAIService();
export { orchestrator } from './orchestrator';

