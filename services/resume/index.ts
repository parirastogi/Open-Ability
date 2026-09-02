export interface ResumeService {
  parseResumeFile(fileBase64: string, fileName: string): Promise<{ text: string; email?: string; name?: string }>;
}

export class MockResumeService implements ResumeService {
  async parseResumeFile(fileBase64: string, fileName: string): Promise<{ text: string; email?: string; name?: string }> {
    // Return standard mock candidate text based on the file name or generic format
    const isSpecialDemo = fileName.toLowerCase().includes('demo') || fileName.toLowerCase().includes('vidhwan');

    if (isSpecialDemo) {
      return {
        text: `Alex Rivera
Email: alex.rivera@example.com
Phone: (555) 019-2834
Summary: Highly creative frontend developer with 4 years of experience specializing in React, TypeScript, and accessible UI design. Committed to building beautiful web interfaces that are usable by everyone.
Skills: React, TypeScript, Tailwind CSS, HTML5, CSS3, JavaScript, Web Accessibility, ARIA, Git.
Education: B.S. in Computer Science, State University.`,
        email: 'alex.rivera@example.com',
        name: 'Alex Rivera'
      };
    }

    return {
      text: `John Doe
Email: john.doe@example.com
Summary: Experienced software engineer with a focus on Python and SQL. 5+ years of experience in backend services.
Skills: Python, SQL, PostgreSQL, Docker, Git, REST APIs, Linux.
Education: M.S. in Software Engineering.`,
      email: 'john.doe@example.com',
      name: 'John Doe'
    };
  }
}

export const resumeService = new MockResumeService();
