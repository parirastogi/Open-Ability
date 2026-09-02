export interface SkillGapAnalysis {
  candidateSkills: string[];
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  learningPath: {
    title: string;
    description: string;
    estimatedTime: string;
    resource: string;
  }[];
}

export class SkillsAgent {
  async analyzeGaps(candidateSkills: string[], targetRole: string): Promise<SkillGapAnalysis> {
    const roleSkillMap: Record<string, string[]> = {
      'Accessible UI Engineer': ['React', 'TypeScript', 'Web Accessibility', 'ARIA', 'Semantic HTML', 'Tailwind CSS'],
      'Frontend Developer': ['React', 'TypeScript', 'HTML5', 'CSS3', 'JavaScript', 'Git'],
      'Backend Systems Engineer': ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs'],
      'Full Stack Developer': ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Web Accessibility'],
      'Data Engineer': ['Python', 'Pandas', 'SQL', 'PostgreSQL', 'Docker', 'Linux']
    };

    const required = roleSkillMap[targetRole] || roleSkillMap['Accessible UI Engineer'];
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());

    const matchedSkills = required.filter(s => candidateSkillsLower.includes(s.toLowerCase()));
    const missingSkills = required.filter(s => !candidateSkillsLower.includes(s.toLowerCase()));

    const matchPercentage = Math.round((matchedSkills.length / required.length) * 100);

    const learningPath = missingSkills.map((skill) => ({
      title: `Mastering ${skill}`,
      description: `Targeted course module to build proficiency in ${skill} for ${targetRole} roles.`,
      estimatedTime: '2 - 3 Weeks',
      resource: `OpenAbility Interactive Skill Module: ${skill}`
    }));

    return {
      candidateSkills,
      targetRole,
      matchedSkills,
      missingSkills,
      matchPercentage,
      learningPath
    };
  }
}

export const skillsAgent = new SkillsAgent();
