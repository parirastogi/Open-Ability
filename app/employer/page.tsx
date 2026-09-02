'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { matchingService } from '@/services/matching';
import { 
  Building2, 
  Plus, 
  Accessibility, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface EmployerJob {
  id: string;
  title: string;
  company: string;
  description: string;
  workType: 'REMOTE' | 'HYBRID' | 'OFFICE';
  requirements: string;
  location: string;
  skills: string[];
  accessibility: {
    remoteAvailable: boolean;
    flexibleHours: boolean;
    screenReaderCompatible: boolean;
    captionSupport: boolean;
    textCommunication: boolean;
    accessibleInterview: boolean;
    physicalAccessibility: boolean;
    assistiveTechnologySupport: boolean;
    readinessScore: number;
  };
}

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  
  // Job Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [experienceRequired, setExperienceRequired] = useState(2);
  const [workType, setWorkType] = useState<'REMOTE' | 'HYBRID' | 'OFFICE'>('REMOTE');
  
  // Accessibility Toggles
  const [remoteAvailable, setRemoteAvailable] = useState(true);
  const [flexibleHours, setFlexibleHours] = useState(true);
  const [screenReaderCompatible, setScreenReaderCompatible] = useState(false);
  const [captionSupport, setCaptionSupport] = useState(false);
  const [textCommunication, setTextCommunication] = useState(true);
  const [accessibleInterview, setAccessibleInterview] = useState(true);
  const [physicalAccessibility, setPhysicalAccessibility] = useState(false);
  const [assistiveTechnologySupport, setAssistiveTechnologySupport] = useState(true);

  // Load Seeded positions on mount
  useEffect(() => {
    const formattedSeedJobs: EmployerJob[] = seedJobs.slice(0, 4).map(sj => ({
      id: sj.id,
      title: sj.title,
      company: sj.company,
      description: sj.description,
      workType: sj.workType as any,
      requirements: sj.requirements,
      location: sj.location,
      skills: sj.skills?.map(s => s.skill?.name || '') || [],
      accessibility: {
        remoteAvailable: sj.accessibility?.remoteAvailable || false,
        flexibleHours: sj.accessibility?.flexibleHours || false,
        screenReaderCompatible: sj.accessibility?.screenReaderCompatible || false,
        captionSupport: sj.accessibility?.captionSupport || false,
        textCommunication: sj.accessibility?.textCommunication || false,
        accessibleInterview: sj.accessibility?.accessibleInterview || false,
        physicalAccessibility: sj.accessibility?.physicalAccessibility || false,
        assistiveTechnologySupport: sj.accessibility?.assistiveTechnologySupport || false,
        readinessScore: sj.accessibility?.readinessScore || 70
      }
    }));
    
    setJobs(formattedSeedJobs);
    if (formattedSeedJobs.length > 0) {
      setSelectedJobId(formattedSeedJobs[0].id);
    }
  }, []);

  // Compute dynamic readiness score
  const calculateReadinessScore = () => {
    const checks = [
      remoteAvailable,
      flexibleHours,
      screenReaderCompatible,
      captionSupport,
      textCommunication,
      accessibleInterview,
      physicalAccessibility,
      assistiveTechnologySupport
    ];
    const yesCount = checks.filter(Boolean).length;
    return Math.round((yesCount / checks.length) * 100);
  };

  const currentReadinessScore = calculateReadinessScore();

  // Create Job Position
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newJob: EmployerJob = {
      id: 'job-' + Date.now(),
      title,
      company: 'Vidhwan Labs',
      description,
      workType,
      requirements: 'Experience building applications. Good communication and collaboration skills.',
      location: 'Remote (US/Canada)',
      skills: skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      accessibility: {
        remoteAvailable,
        flexibleHours,
        screenReaderCompatible,
        captionSupport,
        textCommunication,
        accessibleInterview,
        physicalAccessibility,
        assistiveTechnologySupport,
        readinessScore: currentReadinessScore
      }
    };

    const nextJobs = [newJob, ...jobs];
    setJobs(nextJobs);
    setSelectedJobId(newJob.id);

    // Reset Form
    setTitle('');
    setDescription('');
    setSkillsRequired('');
    setExperienceRequired(2);
    setScreenReaderCompatible(false);
    setCaptionSupport(false);
    setPhysicalAccessibility(false);
    alert(`Successfully created job "${newJob.title}" with a ${currentReadinessScore}% Accessibility Readiness Score!`);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Mock candidates database for matching
  const mockCandidates = [
    {
      name: 'Candidate A (Alex R.)',
      skills: ['React', 'TypeScript', 'Web Accessibility', 'HTML5', 'CSS3', 'Git'],
      experienceYears: 4,
      accessibility: {
        workPreference: 'REMOTE' as const,
        communicationPreference: 'TEXT' as const,
        screenReaderRequired: false,
        highContrastRequired: true,
        largeTextRequired: true,
        captionsRequired: false,
        textCommunicationOnly: true,
        accessiblePhysicalSpace: false,
        flexibleHours: true,
        keyboardNavigationOnly: false,
        accommodations: ['Text Communication Only', 'Flexible Hours', 'High Contrast Layouts']
      }
    },
    {
      name: 'Candidate B (Taylor S.)',
      skills: ['Python', 'SQL', 'Machine Learning', 'Data Analysis', 'Docker'],
      experienceYears: 3,
      accessibility: {
        workPreference: 'REMOTE' as const,
        communicationPreference: 'VOICE' as const,
        screenReaderRequired: true,
        highContrastRequired: false,
        largeTextRequired: false,
        captionsRequired: false,
        textCommunicationOnly: false,
        accessiblePhysicalSpace: false,
        flexibleHours: false,
        keyboardNavigationOnly: true,
        accommodations: ['Screen Reader Compatible', 'Keyboard-Only Navigation']
      }
    },
    {
      name: 'Candidate C (Jordan M.)',
      skills: ['JavaScript', 'HTML5', 'CSS3', 'WordPress', 'SEO'],
      experienceYears: 2,
      accessibility: {
        workPreference: 'HYBRID' as const,
        communicationPreference: 'SIGN_LANGUAGE' as const,
        screenReaderRequired: false,
        highContrastRequired: false,
        largeTextRequired: false,
        captionsRequired: true,
        textCommunicationOnly: false,
        accessiblePhysicalSpace: true,
        flexibleHours: true,
        keyboardNavigationOnly: false,
        accommodations: ['Caption Support', 'Wheelchair Physical Space', 'Flexible Working Hours']
      }
    }
  ];

  // Calculate Matches dynamically for selected job
  const getCandidateMatches = () => {
    if (!selectedJob) return [];

    // Map back to schema shape for calculator
    const dummyJobSchema = {
      id: selectedJob.id,
      title: selectedJob.title,
      company: selectedJob.company,
      description: selectedJob.description,
      requirements: selectedJob.requirements,
      location: selectedJob.location,
      workType: selectedJob.workType,
      createdAt: new Date(),
      updatedAt: new Date(),
      skills: selectedJob.skills.map(s => ({
        id: s,
        jobId: selectedJob.id,
        skillId: s,
        skill: { id: s, name: s },
        isRequired: true,
        importance: 1
      })),
      accessibility: {
        id: selectedJob.id,
        jobId: selectedJob.id,
        remoteAvailable: selectedJob.accessibility.remoteAvailable,
        flexibleHours: selectedJob.accessibility.flexibleHours,
        screenReaderCompatible: selectedJob.accessibility.screenReaderCompatible,
        captionSupport: selectedJob.accessibility.captionSupport,
        textCommunication: selectedJob.accessibility.textCommunication,
        accessibleInterview: selectedJob.accessibility.accessibleInterview,
        physicalAccessibility: selectedJob.accessibility.physicalAccessibility,
        assistiveTechnologySupport: selectedJob.accessibility.assistiveTechnologySupport,
        readinessScore: selectedJob.accessibility.readinessScore
      }
    };

    return mockCandidates.map(c => {
      // Create Candidate Profiles
      const cProfile = {
        id: c.name,
        userId: c.name,
        fullName: c.name,
        targetRoles: ['Engineer', 'Developer'],
        experienceYears: c.experienceYears,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const cAcc = {
        id: c.name,
        candidateProfileId: c.name,
        communicationPreference: c.accessibility.communicationPreference,
        screenReaderRequired: c.accessibility.screenReaderRequired,
        highContrastRequired: c.accessibility.highContrastRequired,
        largeTextRequired: c.accessibility.largeTextRequired,
        captionsRequired: c.accessibility.captionsRequired,
        textCommunicationOnly: c.accessibility.textCommunicationOnly,
        accessiblePhysicalSpace: c.accessibility.accessiblePhysicalSpace,
        workPreference: c.accessibility.workPreference,
        flexibleHours: c.accessibility.flexibleHours,
        keyboardNavigationOnly: c.accessibility.keyboardNavigationOnly,
        accommodations: c.accessibility.accommodations,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const match = matchingService.calculateMatch(cProfile, cAcc, c.skills, dummyJobSchema);
      return {
        name: c.name,
        skills: c.skills,
        experienceYears: c.experienceYears,
        score: match.overallScore
      };
    }).sort((a, b) => b.score - a.score);
  };

  const matches = getCandidateMatches();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition cursor-pointer select-none" aria-label="Go to Home page">
          <img 
            src="/logo/logo.jpeg" 
            alt="OpenAbility AI Logo" 
            className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30 group-hover:border-emerald-400 transition" 
          />
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              OpenAbility AI
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Employer Workspace</p>
          </div>
        </Link>
        <Link 
          href="/dashboard"
          className="text-xs font-bold px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl transition"
        >
          Candidate Dashboard
        </Link>
      </div>

      {/* Main Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Roles list & matches (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Roles header selection tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-855 pb-3 text-slate-850 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-emerald-500" /> Active Job Vacancies
            </h3>

            {/* List selector */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {jobs.map(j => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJobId(j.id)}
                  className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition shrink-0 focus:outline-none ${
                    selectedJobId === j.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-extrabold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {j.title}
                </button>
              ))}
            </div>

            {selectedJob && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3.5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">{selectedJob.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">{selectedJob.workType} • Required Skills: {selectedJob.skills.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-500">{selectedJob.accessibility.readinessScore}%</span>
                    <span className="text-[8px] text-slate-400 font-bold block uppercase mt-0.5">Readiness</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Matches */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-855 pb-3 text-slate-850 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-emerald-500" /> Compatible Talent Matches
            </h3>

            {/* Privacy guidelines alert banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-150 dark:border-slate-850 text-[10px] text-slate-450 flex items-start gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Protected</strong>: Candidate identities and diagnostic accessibility accommodations are anonymized. Employers evaluate compatible ratings based on skills and work preference requirements.
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {matches.map((c, idx) => (
                <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">{c.name}</h4>
                    <p className="text-[10px] text-slate-450">{c.experienceYears} Years Exp • Core: {c.skills.slice(0, 3).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-500">{c.score}%</span>
                    <span className="text-[8px] text-slate-400 font-bold block uppercase mt-0.5">Match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusion Insights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-855 pb-3 text-slate-850 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-500" /> Workplace Inclusion Insights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1">
                <span className="text-[9px] text-emerald-500 font-bold block uppercase tracking-widest">Async Text Boost</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white block mt-1">30% wider talent coverage</span>
                <p className="text-[10px] text-slate-450 leading-relaxed mt-0.5">
                  Supporting asynchronous text chats unlocks applications from speech and hearing impaired candidates.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1">
                <span className="text-[9px] text-emerald-500 font-bold block uppercase tracking-widest">Accessibility Rating</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white block mt-1">2.4x higher retention rates</span>
                <p className="text-[10px] text-slate-450 leading-relaxed mt-0.5">
                  Remote and flexible scheduler parameters decrease workplace burnout quotients by more than 50%.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Job Creation Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-850 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-emerald-500" /> Post New Inclusive position
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-4">
              {/* Job Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. AI Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Summarize the core technical role..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                  required
                />
              </div>

              {/* Required Skills */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Python"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                />
              </div>

              {/* Work Setting & Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Mode</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white text-slate-705"
                  >
                    <option value="REMOTE">Fully Remote</option>
                    <option value="HYBRID">Hybrid Model</option>
                    <option value="OFFICE">Office Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={experienceRequired}
                    onChange={(e) => setExperienceRequired(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Accessibility Readiness checklist */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pb-1">Workplace Support Options</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  {[
                    { label: 'Remote Available', val: remoteAvailable, set: setRemoteAvailable },
                    { label: 'Flexible Schedules', val: flexibleHours, set: setFlexibleHours },
                    { label: 'Screen Reader Support', val: screenReaderCompatible, set: setScreenReaderCompatible },
                    { label: 'Audio Caption Support', val: captionSupport, set: setCaptionSupport },
                    { label: 'Text-Only Message Channels', val: textCommunication, set: setTextCommunication },
                    { label: 'Accessible Interview Channels', val: accessibleInterview, set: setAccessibleInterview },
                    { label: 'Wheelchair Facilities', val: physicalAccessibility, set: setPhysicalAccessibility },
                    { label: 'Assistive Tech Setup', val: assistiveTechnologySupport, set: setAssistiveTechnologySupport }
                  ].map((chk, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-350">
                      <input
                        type="checkbox"
                        checked={chk.val}
                        onChange={(e) => chk.set(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-650 focus:ring-emerald-450 focus:outline-none shrink-0"
                      />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Readiness Score preview */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-white flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Accessibility Readiness Score:</span>
                <span className="text-emerald-400">{currentReadinessScore}%</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition focus:outline-none shadow-md shadow-emerald-500/10"
              >
                Create Job Opening
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
