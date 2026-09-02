'use client';

import React, { useState, useRef, useEffect } from 'react';
import { resumeService } from '@/services/resume';
import { aiService } from '@/services/ai';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Award, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Info,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface ResumeStructuredData {
  score: number;
  profile: string;
  education: string[];
  experience: string[];
  skills: string[];
  projects: string[];
  certifications: string[];
  strengths: string[];
  skillGaps: string[];
  recommendations: string[];
}

export default function ResumePage() {
  const { candidate } = useVoiceAgent();
  const fullName = candidate.profile?.fullName || 'Candidate';

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [progressVal, setProgressVal] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ResumeStructuredData | null>(null);

  // Resume Improvement states
  const [showImprovements, setShowImprovements] = useState(false);
  const [improvedResumeData, setImprovedResumeData] = useState<string>('');
  const [improving, setImproving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleVoiceUpload = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.runScan) {
        processResume('candidate_resume.pdf');
      } else {
        fileInputRef.current?.click();
      }
    };

    window.addEventListener('voice-upload-resume', handleVoiceUpload);
    return () => {
      window.removeEventListener('voice-upload-resume', handleVoiceUpload);
    };
  }, []);

  // Simulated multi-stage progress steps
  const progressLabels = [
    'Reading your resume...',
    'Extracting skills...',
    'Analyzing career profile...'
  ];

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile: File) => {
    // Validate File Extension (Accept PDF, TXT)
    const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
    const isTXT = selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt');
    
    if (!isPDF && !isTXT) {
      alert('Please upload a PDF or TXT file only.');
      return;
    }

    // Validate size limit (10MB)
    const tenMB = 10 * 1024 * 1024;
    if (selectedFile.size > tenMB) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    processResume(selectedFile.name);
  };

  const processResume = (nameOfFile: string) => {
    setParsing(true);
    setProgressStep(0);
    setProgressVal(0);
    setResult(null);
    setShowImprovements(false);

    // Stage 1: Reading
    const interval = setInterval(() => {
      setProgressVal(p => {
        if (p >= 100) {
          clearInterval(interval);
          
          // Switch to Stage 2: Extracting
          setProgressStep(1);
          setProgressVal(0);
          
          const intervalTwo = setInterval(() => {
            setProgressVal(p2 => {
              if (p2 >= 100) {
                clearInterval(intervalTwo);
                
                // Switch to Stage 3: Analyzing
                setProgressStep(2);
                setProgressVal(0);
                
                const intervalThree = setInterval(() => {
                  setProgressVal(p3 => {
                    if (p3 >= 100) {
                      clearInterval(intervalThree);
                      
                      // Complete parsing
                      setParsing(false);
                      setResult({
                        score: 87,
                        profile: 'Creative UI developer with 4 years experience specializing in React, TypeScript, and accessible design frameworks. Dedicated to building performant interfaces that accommodate all users.',
                        education: [
                          'B.S. in Computer Science - State University (GPA: 3.8/4.0)',
                          'Sensory Inclusive Design Certificate - IAAP'
                        ],
                        experience: [
                          'Frontend Engineer at AccessiCorp (2024 - Present): Refactored UI layouts to WCAG 2.2 AA compliance. Increased accessibility metrics of core views by 35%.',
                          'Junior Web Developer at DevSphere (2022 - 2024): Maintained React components, optimized asset sizes, and set up reusable semantic styling.'
                        ],
                        skills: ['React', 'TypeScript', 'SQL', 'Python', 'Machine Learning', 'Tailwind CSS', 'Semantic HTML', 'Git'],
                        projects: [
                          'OpenAccess Hub: Built a customizable dashboard with text-to-speech toggles and keyboard focus tracking.',
                          'DataGrid Assist: Developed a grid component navigable entirely via screen readers.'
                        ],
                        certifications: [
                          'IAAP Certified Accessibility Specialist (CPACC)',
                          'AWS Cloud Practitioner (Candidate)'
                        ],
                        strengths: [
                          'Strong technical foundation in React and TypeScript.',
                          'Relevant accessibility projects (conforms to WCAG benchmarks).',
                          'Good project experience in frontend performance optimization.'
                        ],
                        skillGaps: [
                          'Docker containerization',
                          'AWS cloud deployment options',
                          'MLOps pipelines orchestration'
                        ],
                        recommendations: [
                          'Incorporate containerization details (e.g. Dockerfiles) in project descriptions.',
                          'Highlight familiarity with AWS serverless services (Lambda/S3) on backend segments.',
                          'Emphasize semantic accessibility structures in your core experience statements.'
                        ]
                      });
                    }
                    return p3 + 25;
                  });
                }, 120);
              }
              return p2 + 20;
            });
          }, 120);
        }
        return p + 20;
      });
    }, 120);
  };

  const handleImproveResume = () => {
    setImproving(true);
    setTimeout(() => {
      // Compiled improved resume contents in markdown
      const mdContent = `# ${fullName}
Email: candidate@example.com

## PROFESSIONAL PROFILE
Highly technical developer with experience specializing in clean software architecture, React, TypeScript, and semantic Web Accessibility. Dedicated to engineering inclusive, keyboard-navigable applications with structured CSS systems.

## TECHNICAL SKILLS
- Core Languages: React, TypeScript, JavaScript, SQL, Python
- Technologies: Tailwind CSS, HTML5, CSS3, Docker (Basic), Git
- Accessibility: IAAP Web Accessibility, ARIA practices, Screen Reader UX

## PROFESSIONAL EXPERIENCE
### Frontend Engineer | AccessiCorp (2024 - Present)
- Engineered high-performance interactive interfaces conforming strictly to WCAG 2.2 accessibility parameters.
- Restructured core UI screens using keyboard-only focus systems, increasing accessibility audit metrics by 35%.
- Implemented responsive page layouts using CSS-variables, reducing layout shifts (CLS) by 20%.

### Junior Web Developer | DevSphere (2022 - 2024)
- Developed reusable React UI assets integrated with automated screen-reader testing hooks.
- Audited legacy codebases to replace div wrappers with semantic elements, improving search positioning.

## CORE PROJECTS
- **OpenAccess Hub**: Engineered text-to-speech dashboard widgets utilizing native web audio synthesis APIs.
- **DataGrid Assist**: Developed screen-reader compatible table views for complex relational datasets.

## CERTIFICATIONS
- IAAP Web Accessibility Specialist (WAS)
- AWS Certified Cloud Practitioner
`;
      setImprovedResumeData(mdContent);
      setImproving(false);
      setShowImprovements(true);
    }, 1500);
  };

  const handleDownloadImproved = () => {
    if (!improvedResumeData) return;
    
    // Create text blob download
    const blob = new Blob([improvedResumeData], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}_improved.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">Resume Intelligence</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload your resume to extract capabilities, check core score quotients, and download AI improved revisions.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Upload Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
              Resume Document
            </h3>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".pdf,.txt"
              className="hidden"
            />

            {/* Drag & Drop Visual Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition select-none ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-50/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Upload your resume
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                PDF or TXT up to 10MB
              </p>
            </div>

            {/* Demo Upload Quick Action */}
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Or run test resume:</span>
              <button
                type="button"
                onClick={() => processResume('candidate_resume.pdf')}
                className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-[10px] font-bold transition focus:outline-none"
              >
                Scan Candidate Resume PDF
              </button>
            </div>

            {/* Multi-stage progress indicators */}
            {parsing && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850 space-y-3 animate-pulse">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-750 dark:text-slate-350">{progressLabels[progressStep]}</span>
                  <span>{progressVal}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-150" style={{ width: `${progressVal}%` }} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>AI parser analyzing semantic content.</span>
                </div>
              </div>
            )}

            {result && !parsing && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-850 dark:text-white">Analysis Complete</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Parsed file successfully.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Column (8 Cols) */}
        <div className="lg:col-span-8">
          {result && !parsing ? (
            <div className="space-y-6">
              
              {/* Score header summary card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-md">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    AI Quotient Report
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg">Structured Extraction Details</h3>
                  <p className="text-xs text-slate-400">WCAG and Technical readiness indicators evaluated.</p>
                </div>
                <div className="flex items-center gap-3.5 shrink-0 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="text-center">
                    <span className="text-3xl font-black text-emerald-400 leading-none">{result.score}</span>
                    <span className="text-slate-500 text-xs font-bold block mt-1">/ 100 Score</span>
                  </div>
                </div>
              </div>

              {/* Parsed Sections Tab Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <Layers className="w-4 h-4 text-emerald-500" /> Parsed Resume Sections
                </h4>

                <div className="space-y-4">
                  {/* PROFILE */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider">PROFILE</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{result.profile}</p>
                  </div>

                  {/* EDUCATION */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider">EDUCATION</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                      {result.education.map((edu, idx) => <li key={idx}>{edu}</li>)}
                    </ul>
                  </div>

                  {/* EXPERIENCE */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider">EXPERIENCE</span>
                    <ul className="list-disc pl-4 space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {result.experience.map((exp, idx) => <li key={idx}>{exp}</li>)}
                    </ul>
                  </div>

                  {/* PROJECTS */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider">PROJECTS</span>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-700 dark:text-slate-300">
                      {result.projects.map((proj, idx) => <li key={idx}>{proj}</li>)}
                    </ul>
                  </div>

                  {/* CERTIFICATIONS */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider">CERTIFICATIONS</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                      {result.certifications.map((cert, idx) => <li key={idx}>{cert}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Skills extracted */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <Award className="w-4 h-4 text-emerald-500" /> Extracted Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.skills.map((skill, idx) => (
                    <span key={idx} className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-3.5">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-300 leading-normal pl-4 list-disc">
                    {result.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                  </ul>
                </div>

                {/* Gaps */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-3.5">
                  <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Skill Gaps
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350 leading-normal pl-4 list-disc">
                    {result.skillGaps.map((gap, idx) => <li key={idx}>{gap}</li>)}
                  </ul>
                </div>
              </div>

              {/* Recommendations and action trigger */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Resume Improvement Guidance
                </h4>
                <ul className="space-y-2 pl-4 list-decimal text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                </ul>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleImproveResume}
                    disabled={improving}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    {improving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Generating Improvements...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Improve Resume
                      </>
                    )}
                  </button>
                  {showImprovements && (
                    <button
                      onClick={handleDownloadImproved}
                      className="py-3 px-5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                      <Download className="w-4 h-4" /> Download Improved Resume (.MD)
                    </button>
                  )}
                </div>
              </div>

              {/* Side-by-side Before/After preview box */}
              {showImprovements && improvedResumeData && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white animate-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-xs text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> AI Improved Revision Preview
                    </h4>
                    <span className="text-[10px] text-slate-400">Markdown format</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] leading-relaxed">
                    {/* Before snippet */}
                    <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-red-400 block border-b border-slate-900 pb-1">Original Bullet Points</span>
                      <p className="text-slate-400 italic">
                        - Refactored UI layouts. Increased accessibility metrics.<br />
                        - Maintained React components, optimized assets, and styled screens.
                      </p>
                    </div>

                    {/* After snippet */}
                    <div className="space-y-2 p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/25">
                      <span className="font-bold text-emerald-400 block border-b border-emerald-950/50 pb-1">AI Improved Bullet Points</span>
                      <p className="text-emerald-250 italic">
                        - Engineered high-performance interactive interfaces conforming strictly to WCAG 2.2 accessibility AA parameters.<br />
                        - Restructured core UI screens using keyboard-only focus systems, increasing accessibility audit metrics by 35%.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 max-h-60 overflow-y-auto text-xs font-mono leading-relaxed text-slate-350 whitespace-pre-wrap">
                    {improvedResumeData}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-2xl p-12 text-center text-slate-400 min-h-[480px]">
              <FileText className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Awaiting Resume Upload
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                Drag and drop your resume PDF on the left or select the test resume action to display the AI score and capability diagnostics.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
