import { Skill, Job, CandidateProfile, AccessibilityProfile } from '@/types';

export const seedSkills: Skill[] = [
  // Frontend
  { id: 's1', name: 'React', category: 'Frontend', description: 'Component-based UI library' },
  { id: 's2', name: 'TypeScript', category: 'Frontend', description: 'Typed programming language' },
  { id: 's3', name: 'Next.js', category: 'Frontend', description: 'React application framework' },
  { id: 's4', name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework' },
  { id: 's5', name: 'HTML5', category: 'Frontend', description: 'Web page layout' },
  { id: 's6', name: 'CSS3', category: 'Frontend', description: 'Web page styling' },
  { id: 's7', name: 'JavaScript', category: 'Frontend', description: 'Web scripting language' },
  { id: 's8', name: 'Redux', category: 'Frontend', description: 'State management library' },
  { id: 's9', name: 'Vue.js', category: 'Frontend', description: 'Progressive JS framework' },
  { id: 's10', name: 'Angular', category: 'Frontend', description: 'Enterprise front-end platform' },
  // Backend
  { id: 's11', name: 'Node.js', category: 'Backend', description: 'Server-side JS execution' },
  { id: 's12', name: 'Python', category: 'Backend', description: 'General scripting and backend language' },
  { id: 's13', name: 'PostgreSQL', category: 'Backend', description: 'Relational database management' },
  { id: 's14', name: 'Express', category: 'Backend', description: 'Minimalist Node.js framework' },
  { id: 's15', name: 'GraphQL', category: 'Backend', description: 'Query language for APIs' },
  { id: 's16', name: 'Prisma ORM', category: 'Backend', description: 'Database toolkit for Node/TS' },
  { id: 's17', name: 'Django', category: 'Backend', description: 'Python high-level web framework' },
  { id: 's18', name: 'Ruby on Rails', category: 'Backend', description: 'Productive server framework' },
  { id: 's19', name: 'Go', category: 'Backend', description: 'Fast compiled backend language' },
  { id: 's20', name: 'MongoDB', category: 'Backend', description: 'Document-oriented database' },
  // AI & Data
  { id: 's21', name: 'Machine Learning', category: 'Data & AI', description: 'Pattern recognition algorithms' },
  { id: 's22', name: 'PyTorch', category: 'Data & AI', description: 'Deep learning framework' },
  { id: 's23', name: 'TensorFlow', category: 'Data & AI', description: 'Open source ML platform' },
  { id: 's24', name: 'Pandas', category: 'Data & AI', description: 'Data structures and analysis library' },
  { id: 's25', name: 'Scikit-Learn', category: 'Data & AI', description: 'Machine learning in Python' },
  { id: 's26', name: 'OpenAI API', category: 'Data & AI', description: 'LLM application development' },
  { id: 's27', name: 'LangChain', category: 'Data & AI', description: 'Framework for LLM applications' },
  { id: 's28', name: 'NLP', category: 'Data & AI', description: 'Natural Language Processing' },
  { id: 's29', name: 'Computer Vision', category: 'Data & AI', description: 'Image and video interpretation' },
  { id: 's30', name: 'Data Visualization', category: 'Data & AI', description: 'Visual mapping of data' },
  // Cloud & DevOps
  { id: 's31', name: 'Docker', category: 'Cloud & DevOps', description: 'Containerization tool' },
  { id: 's32', name: 'Kubernetes', category: 'Cloud & DevOps', description: 'Container orchestration' },
  { id: 's33', name: 'AWS', category: 'Cloud & DevOps', description: 'Amazon Web Services cloud' },
  { id: 's34', name: 'GitHub Actions', category: 'Cloud & DevOps', description: 'CI/CD runner workflows' },
  { id: 's35', name: 'Terraform', category: 'Cloud & DevOps', description: 'Infrastructure as code' },
  { id: 's36', name: 'Linux', category: 'Cloud & DevOps', description: 'Server operating system' },
  // Accessibility & UX
  { id: 's37', name: 'Web Accessibility', category: 'Design & Accessibility', description: 'WCAG compliance standards' },
  { id: 's38', name: 'ARIA', category: 'Design & Accessibility', description: 'Accessible Rich Internet Applications' },
  { id: 's39', name: 'Figma', category: 'Design & Accessibility', description: 'Collaborative interface design tool' },
  { id: 's40', name: 'Screen Reader UX', category: 'Design & Accessibility', description: 'Designing for VoiceOver/NVDA' },
  { id: 's41', name: 'Semantic HTML', category: 'Design & Accessibility', description: 'Meaningful elements markup' },
  // QA, Project & Soft Skills
  { id: 's42', name: 'Jest', category: 'QA', description: 'JavaScript testing framework' },
  { id: 's43', name: 'Cypress', category: 'QA', description: 'End-to-end testing' },
  { id: 's44', name: 'Agile', category: 'Management', description: 'Iterative project management' },
  { id: 's45', name: 'Technical Writing', category: 'Communication', description: 'Documentation and guides' },
  { id: 's46', name: 'Git', category: 'Developer Tools', description: 'Version control software' },
  { id: 's47', name: 'SQL', category: 'Backend', description: 'Structured query language' },
  { id: 's48', name: 'REST APIs', category: 'Backend', description: 'Web services architecture' },
  { id: 's49', name: 'FastAPI', category: 'Backend', description: 'Modern Python web framework' },
  { id: 's50', name: 'UI/UX Design', category: 'Design & Accessibility', description: 'User interface design theory' }
];

export const seedJobs: Job[] = Array.from({ length: 30 }).map((_, index) => {
  const jobTitles = [
    'Accessible UI Engineer', 'Full Stack Developer', 'Frontend Architect', 
    'Python AI Researcher', 'PostgreSQL Database Analyst', 'DevOps Automations Lead',
    'Accessibility QA Analyst', 'React Specialist', 'Junior Software Developer',
    'Lead Accessibility Consultant', 'NLP Research Engineer', 'UX UI Designer',
    'Backend Systems Engineer', 'Data Engineer', 'AI Integration Engineer',
    'Documentation Developer', 'Cloud Infrastructure Engineer', 'Web Applications Specialist',
    'Inclusive Product Manager', 'Developer Advocate', 'Data Science Advisor',
    'Customer Operations Engineer', 'Scrum Master', 'Solutions Architect',
    'Automation Test Engineer', 'Technical Support Specialist', 'Site Reliability Engineer',
    'Machine Learning Architect', 'Interaction Designer', 'Web Development Lead'
  ];

  const companies = [
    'AccessiCorp', 'Vidhwan Labs', 'EduTech Solutions', 'OpenSphere AI', 'DevNexus',
    'AlphaFlow', 'StripePath', 'CloudScale', 'OptimaHealth', 'FutureGrid',
    'GreenTerra Technologies', 'ApexDesign', 'DataVanguard', 'NeuralNexus', 'SecureScale'
  ];

  const locations = [
    'Remote', 'Hybrid - San Francisco, CA', 'New York, NY', 'Remote - Austin, TX',
    'Hybrid - Seattle, WA', 'Chicago, IL', 'Remote - Boston, MA', 'Denver, CO'
  ];

  const salaryRanges = [
    '$110,000 - $140,000', '$90,000 - $120,000', '$130,000 - $170,000',
    '$150,000 - $190,000', '$80,000 - $105,000', '$120,000 - $155,000',
    '$140,000 - $180,000'
  ];

  const workTypes: ('REMOTE' | 'HYBRID' | 'OFFICE')[] = ['REMOTE', 'HYBRID', 'OFFICE'];

  const title = jobTitles[index];
  const company = companies[index % companies.length];
  const location = locations[index % locations.length];
  const salaryRange = salaryRanges[index % salaryRanges.length];
  const workType = title.toLowerCase().includes('remote') ? 'REMOTE' : workTypes[index % workTypes.length];
  const description = `Join the team at ${company} as a ${title}. We are building the next generation of accessible and performant systems. Our team values diversity, accessibility, and potential. We support flexible schedules, diverse communication tools, and ensure screen reader accessibility across our products.`;
  
  const requirements = `Candidates should have 3+ years of experience. Required proficiency in programming languages and frameworks relevant to the role. Experience in collaborative and inclusive engineering teams is a major plus.`;

  // Select 3 to 5 skills to associate with this job
  const jobSkillLinks = [
    { skillId: 's1', isRequired: true, importance: 2.0 }, // React
    { skillId: 's2', isRequired: true, importance: 1.5 }, // TypeScript
    { skillId: 's4', isRequired: false, importance: 1.0 }, // Tailwind CSS
    { skillId: 's37', isRequired: true, importance: 2.0 }, // Web Accessibility
    { skillId: 's38', isRequired: true, importance: 1.5 }, // ARIA
    { skillId: 's41', isRequired: false, importance: 1.0 }, // Semantic HTML
  ];

  // Map to matching skills for this job
  let selectedSkillLinks = jobSkillLinks;
  if (index > 0) {
    // Generate random skills for other jobs
    const numSkills = 3 + (index % 3);
    const startIdx = (index * 3) % (seedSkills.length - 5);
    selectedSkillLinks = Array.from({ length: numSkills }).map((_, sIdx) => {
      const targetSkill = seedSkills[startIdx + sIdx];
      return {
        id: `js-${index}-${sIdx}`,
        jobId: `job-${index}`,
        skillId: targetSkill.id,
        skill: targetSkill,
        isRequired: sIdx < 2,
        importance: sIdx === 0 ? 2.0 : 1.0
      };
    }) as any;
  } else {
    // Special setup for Job 0 (Accessible UI Engineer) to match Alex perfectly
    selectedSkillLinks = jobSkillLinks.map((link, sIdx) => ({
      id: `js-0-${sIdx}`,
      jobId: 'job-0',
      skillId: link.skillId,
      skill: seedSkills.find(s => s.id === link.skillId),
      isRequired: link.isRequired,
      importance: link.importance
    }));
  }

  // Accessibility support for this job (make it highly accessible, some hybrid/office features vary)
  const isAccessible = index % 2 === 0;
  const verificationStatuses: ('VERIFIED' | 'EMPLOYER_REPORTED' | 'CANDIDATE_REPORTED' | 'INFERRED' | 'UNKNOWN')[] = [
    'VERIFIED', 'EMPLOYER_REPORTED', 'CANDIDATE_REPORTED', 'INFERRED', 'VERIFIED'
  ];
  
  const accessibilityInfo = {
    id: `acc-${index}`,
    jobId: `job-${index}`,
    remoteAvailable: workType === 'REMOTE' || workType === 'HYBRID',
    flexibleHours: isAccessible || index % 3 === 0,
    screenReaderCompatible: isAccessible || index % 4 === 0,
    captionSupport: isAccessible || index % 5 === 0,
    textCommunication: isAccessible || index % 3 === 0,
    accessibleInterview: true, // All jobs support accessible interviews
    physicalAccessibility: workType !== 'REMOTE' ? isAccessible : true,
    assistiveTechnologySupport: isAccessible,
    verificationStatus: verificationStatuses[index % verificationStatuses.length],
    wheelchairEntrance: isAccessible || workType === 'REMOTE',
    accessibleRestrooms: isAccessible || workType === 'REMOTE',
    accessibleParking: isAccessible || index % 3 === 0 || workType === 'REMOTE',
    elevatorAccess: isAccessible || index % 2 === 0 || workType === 'REMOTE',
    transitProximity: index % 2 === 0 ? '5 mins to Metro station / Braille bus stop' : '15 mins to City Bus Station',
    readinessScore: 0,
    notes: `We accommodate all assistive technology, captions, and text-based communication.`
  };

  // Pre-calculate score
  let score = 0;
  if (accessibilityInfo.remoteAvailable) score += 15;
  if (accessibilityInfo.flexibleHours) score += 15;
  if (accessibilityInfo.screenReaderCompatible) score += 15;
  if (accessibilityInfo.captionSupport) score += 15;
  if (accessibilityInfo.textCommunication) score += 10;
  if (accessibilityInfo.accessibleInterview) score += 10;
  if (accessibilityInfo.physicalAccessibility) score += 10;
  if (accessibilityInfo.assistiveTechnologySupport) score += 10;
  accessibilityInfo.readinessScore = score;

  return {
    id: `job-${index}`,
    title,
    company,
    description,
    requirements,
    location,
    salaryRange,
    workType,
    createdAt: new Date(),
    updatedAt: new Date(),
    skills: selectedSkillLinks,
    accessibility: accessibilityInfo
  } as Job;
});

// Empty Candidate (Clean initial state for new users - Zero Fake Data)
export const emptyCandidate: { profile: CandidateProfile; accessibility: AccessibilityProfile; skills: string[] } = {
  profile: {
    id: 'cand-new',
    userId: 'user-new',
    fullName: '',
    phone: '',
    bio: '',
    targetRoles: [],
    experienceYears: 0,
    education: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  accessibility: {
    id: 'acc-new',
    candidateProfileId: 'cand-new',
    communicationPreference: 'VOICE',
    screenReaderRequired: false,
    highContrastRequired: false,
    largeTextRequired: false,
    captionsRequired: false,
    textCommunicationOnly: false,
    accessiblePhysicalSpace: false,
    workPreference: 'REMOTE',
    flexibleHours: false,
    keyboardNavigationOnly: false,
    assistiveTechDetail: '',
    accommodations: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  skills: []
};

// Polished Demo Candidate (Alex Rivera - kept for explicit legacy reference if requested)
export const demoCandidate: { profile: CandidateProfile; accessibility: AccessibilityProfile; skills: string[] } = {
  profile: {
    id: 'cand-demo',
    userId: 'user-demo',
    fullName: 'Alex Rivera',
    phone: '(555) 019-2834',
    bio: 'Highly creative frontend developer with a deep passion for building fully accessible web interfaces. Expert in React and TypeScript. Specializes in custom semantic layouts and high-performance, key-navigable interfaces.',
    targetRoles: ['Accessible UI Engineer', 'Frontend Developer', 'UI Engineer'],
    experienceYears: 4,
    education: 'B.S. in Computer Science, State University',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  accessibility: {
    id: 'acc-demo',
    candidateProfileId: 'cand-demo',
    communicationPreference: 'TEXT', // Text or Sign Language preference
    screenReaderRequired: true,
    highContrastRequired: true,
    largeTextRequired: false,
    captionsRequired: false,
    textCommunicationOnly: true,
    accessiblePhysicalSpace: false,
    workPreference: 'REMOTE',
    flexibleHours: true,
    keyboardNavigationOnly: true,
    assistiveTechDetail: 'NVDA, JAWS Screen Readers, Braille Display, Keyboard-only navigation',
    accommodations: ['Visual screen reading support', 'Text-only asynchronous chats', 'Flexible submission timings'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'HTML5', 'CSS3', 'JavaScript', 'Web Accessibility', 'ARIA', 'Semantic HTML', 'Git']
};

export const seedCandidates = [
  // Candidate 1: Maya Patel (Backend Developer, hybrid preference, loves voice)
  {
    profile: {
      id: 'cand-1',
      userId: 'user-1',
      fullName: 'Maya Patel',
      phone: '(555) 021-9988',
      bio: 'Systems engineer with 5 years experience designing microservices in Python and Node.js. Enthusiastic about database schema optimization and API performance.',
      targetRoles: ['Backend Systems Engineer', 'Full Stack Developer', 'Data Engineer'],
      experienceYears: 5,
      education: 'M.S. in Computer Engineering, Tech Institute',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    accessibility: {
      id: 'acc-1',
      candidateProfileId: 'cand-1',
      communicationPreference: 'VOICE', // Voice communication preference
      screenReaderRequired: false,
      highContrastRequired: false,
      largeTextRequired: false,
      captionsRequired: true,
      textCommunicationOnly: false,
      accessiblePhysicalSpace: false,
      workPreference: 'HYBRID',
      flexibleHours: false,
      keyboardNavigationOnly: false,
      assistiveTechDetail: 'Hearing aids compatibility',
      accommodations: ['Real-time captions for video calls', 'Noise cancellation guidelines'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'FastAPI', 'SQL', 'REST APIs', 'Git']
  },
  // Candidate 2: Marcus Johnson (Data Analyst, remote or office, flexible hours required, visual assistance required)
  {
    profile: {
      id: 'cand-2',
      userId: 'user-2',
      fullName: 'Marcus Johnson',
      phone: '(555) 032-4455',
      bio: 'Detail-oriented Data Analyst specialized in Python, data cleaning, and creating dashboard visualizations using Pandas and Pandas-adjacent libraries.',
      targetRoles: ['Data Analyst', 'Data Science Advisor', 'Python AI Researcher'],
      experienceYears: 3,
      education: 'B.S. in Statistics, City College',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    accessibility: {
      id: 'acc-2',
      candidateProfileId: 'cand-2',
      communicationPreference: 'TEXT',
      screenReaderRequired: false,
      highContrastRequired: true,
      largeTextRequired: true,
      captionsRequired: false,
      textCommunicationOnly: false,
      accessiblePhysicalSpace: true,
      workPreference: 'HYBRID',
      flexibleHours: true,
      keyboardNavigationOnly: false,
      assistiveTechDetail: 'Large font configurations, physical ergonomic keyboard',
      accommodations: ['Large text formatting', 'Accessible desk workspace', 'Adjustable screen distance support'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    skills: ['Python', 'Pandas', 'Data Visualization', 'SQL', 'PostgreSQL', 'GitHub Actions', 'Linux']
  }
];
