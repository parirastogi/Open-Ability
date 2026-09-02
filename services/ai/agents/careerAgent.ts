import { CareerRecommendation } from '@/types';

export class CareerAgent {
  async generateCareerAdvice(candidateContext: any): Promise<CareerRecommendation[]> {
    const targetRoles = candidateContext.targetRoles || ['Accessible UI Engineer'];
    const skills = candidateContext.skills || ['React', 'TypeScript'];
    const primaryRole = targetRoles[0] || 'Accessible UI Engineer';

    return [
      {
        id: `rec-1-${Date.now()}`,
        candidateProfileId: candidateContext.id || 'cand-demo',
        roleTitle: primaryRole,
        averageSalary: '$120,000 - $155,000',
        skillGaps: ['Advanced ARIA Patterns', 'Jest Unit Testing', 'CI/CD Automation'],
        learningPath: {
          courses: ['WCAG 2.1 AAA Deep Dive', 'React Accessibility Patterns', 'TypeScript Advanced Types'],
          certifications: ['IAAP Certified Web Accessibility Specialist (WAS)'],
          timeline: '4 to 6 Months'
        },
        marketDemand: 'HIGH',
        matchExplanation: `Strong alignment with your core technical competencies in ${skills.slice(0, 3).join(', ')}. High market demand for accessibility-first frontend developers.`,
        recommendedAt: new Date()
      },
      {
        id: `rec-2-${Date.now()}`,
        candidateProfileId: candidateContext.id || 'cand-demo',
        roleTitle: 'Inclusive Product Manager',
        averageSalary: '$135,000 - $175,000',
        skillGaps: ['Product Strategy', 'Agile Roadmapping', 'User Research'],
        learningPath: {
          courses: ['Inclusive Product Management', 'Universal Design Fundamentals'],
          certifications: ['Certified Professional in Accessibility Core Competencies (CPACC)'],
          timeline: '6 to 9 Months'
        },
        marketDemand: 'HIGH',
        matchExplanation: 'Combines technical foundation with accessibility advocacy for high-impact leadership roles.',
        recommendedAt: new Date()
      }
    ];
  }
}

export const careerAgent = new CareerAgent();
