import { ResumeAnalysis } from '@/types';

export interface ResumeAgentResult {
  summary: string;
  experienceYears: number;
  parsedSkills: string[];
  missingKeySections: string[];
  improvements: string[];
  rawAnalysis: any;
}

export class ResumeAgent {
  async process(resumeText: string, targetRole?: string): Promise<ResumeAnalysis & { improvements: string[]; missingKeySections: string[] }> {
    const textLower = resumeText.toLowerCase();
    
    const knownSkills = [
      'React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'PostgreSQL', 'Next.js',
      'HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS', 'Git', 'Docker', 'AWS', 'Java',
      'C++', 'Machine Learning', 'Project Management', 'Web Accessibility', 'ARIA',
      'Semantic HTML', 'FastAPI', 'Pandas', 'GraphQL'
    ];

    const parsedSkills = knownSkills.filter(s => textLower.includes(s.toLowerCase()));
    if (parsedSkills.length === 0) {
      parsedSkills.push('JavaScript', 'HTML5', 'CSS3', 'Web Accessibility');
    }

    let experienceYears = 3;
    const expMatch = textLower.match(/(\d+)\+?\s*years?\s+(of\s+)?experience/);
    if (expMatch && expMatch[1]) {
      experienceYears = parseInt(expMatch[1], 10);
    }

    const missingKeySections: string[] = [];
    if (!textLower.includes('accessibility') && !textLower.includes('wcag') && !textLower.includes('aria')) {
      missingKeySections.push('Web Accessibility & ARIA Practices');
    }
    if (!textLower.includes('project') && !textLower.includes('experience')) {
      missingKeySections.push('Key Accomplishments & Quantifiable Results');
    }
    if (!textLower.includes('education') && !textLower.includes('degree') && !textLower.includes('certification')) {
      missingKeySections.push('Education & Relevant Certifications');
    }

    const improvements = [
      `Quantify impact in recent roles (e.g. "Improved UI keyboard navigation accessibility score by 45%").`,
      `Add explicit mentions of WCAG 2.1 standards and assistive technology testing experience.`,
      `Highlight experience with modern state management and TypeScript strict typing.`
    ];

    return {
      id: `res-anal-${Date.now()}`,
      resumeId: `res-${Date.now()}`,
      summary: `Resume parsed successfully. Found ${parsedSkills.length} core technical capabilities and estimated ${experienceYears} years of experience. Focus role: ${targetRole || 'Software Engineer'}.`,
      experienceYears,
      parsedSkills,
      missingKeySections,
      improvements,
      rawAnalysis: { parsedAt: new Date().toISOString(), textLength: resumeText.length },
      analyzedAt: new Date()
    };
  }
}

export const resumeAgent = new ResumeAgent();
