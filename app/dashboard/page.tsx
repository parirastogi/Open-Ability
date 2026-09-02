'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  FileText, 
  Compass, 
  Sparkles, 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  User,
  Sliders,
  Check,
  Building2,
  TrendingUp,
  Award
} from 'lucide-react';
import { seedJobs } from '@/database/seed-data';
import { useVoiceAgent } from '@/context/VoiceAgentContext';

export default function CandidateDashboard() {
  const { candidate } = useVoiceAgent();
  const profile = candidate.profile;
  const skills = candidate.skills;

  const [filteredJobs, setFilteredJobs] = useState(seedJobs.slice(0, 3));

  const [greeting, setGreeting] = useState<string>('Welcome');

  useEffect(() => {
    const calculateGreeting = () => {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 12) {
        setGreeting('Good morning');
      } else if (hours >= 12 && hours < 17) {
        setGreeting('Good afternoon');
      } else if (hours >= 17 && hours < 21) {
        setGreeting('Good evening');
      } else {
        setGreeting('Good night');
      }
    };
    
    calculateGreeting();
    const interval = setInterval(calculateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (skills.length > 0) {
      const matched = seedJobs.filter(j => 
        j.skills && j.skills.some(s => skills.some(cs => (s.skill?.name || '').toLowerCase().includes(cs.toLowerCase())))
      );
      setFilteredJobs(matched.length > 0 ? matched.slice(0, 3) : seedJobs.slice(0, 3));
    }
  }, [skills]);

  const fullName = profile?.fullName || 'Candidate';
  const firstName = fullName.split(' ')[0] || 'Candidate';
  const targetRole = profile?.targetRoles?.[0] || 'Software Developer';
  const displaySkills = skills.length > 0 ? skills.slice(0, 4) : ['Python', 'Problem Solving', 'SQL'];

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      
      {/* TOP WELCOME & CONTEXT BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              Target Role: {targetRole}
            </span>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Non-Discriminatory Audit Passed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Let's move your career forward. Your profile matches are filtered according to your accessibility preferences.
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl shrink-0 w-full md:w-64 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">Profile Completion</span>
            <span className="font-extrabold text-teal-700">85%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full w-[85%]" />
          </div>
          <Link
            href="/dashboard/profile"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition"
          >
            Complete profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Action 1: Resume */}
          <Link
            href="/dashboard/resume"
            className="p-5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 transition hover:shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">Resume</h3>
              <p className="text-xs text-slate-500 mt-0.5">Improve my resume</p>
            </div>
          </Link>

          {/* Action 2: Jobs */}
          <Link
            href="/dashboard/jobs"
            className="p-5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 transition hover:shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">Jobs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Find matching jobs</p>
            </div>
          </Link>

          {/* Action 3: Career Roadmap */}
          <Link
            href="/dashboard/skills"
            className="p-5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 transition hover:shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">Career</h3>
              <p className="text-xs text-slate-500 mt-0.5">View career roadmap</p>
            </div>
          </Link>

          {/* Action 4: Mock Interview */}
          <Link
            href="/dashboard/interview"
            className="p-5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 transition hover:shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Mic className="w-4.5 h-4.5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">Interview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Practice interview</p>
            </div>
          </Link>

        </div>
      </div>

      {/* 2-COLUMN SECTION: CAREER SNAPSHOT & PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CAREER SNAPSHOT CARD */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Your Career Snapshot</h2>
              <p className="text-xs text-slate-500">Personalized profile match analysis</p>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 font-extrabold text-xs rounded-full border border-teal-200">
              78% Profile Match
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Target Role:</span>
              <p className="font-bold text-slate-900 text-sm">{targetRole}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Workplace Preference:</span>
              <p className="font-bold text-slate-900 text-sm">{profile?.workPreference || 'Remote'}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">Top Verified Skills:</span>
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((sk, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Link
              href="/dashboard/profile"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-teal-400" /> View Career Profile
            </Link>
          </div>
        </div>

        {/* PROGRESS & ACCESSIBILITY STATUS COLUMN */}
        <div className="space-y-6">
          
          {/* ACCESSIBILITY PREFERENCES STATUS CARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Accessibility Preferences</h3>
              <Sliders className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Remote work guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Screen-reader compatible</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Flexible working hours</span>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 block pt-1"
            >
              Manage preferences →
            </Link>
          </div>

          {/* YOUR PROGRESS SECTION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900">Your Progress</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Resume</span>
                  <span>80%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full w-[80%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Skills Roadmap</span>
                  <span>70%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full w-[70%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Career Profile</span>
                  <span>90%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full w-[90%]" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RECOMMENDED FOR YOU JOB FEED */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Recommended for you</h2>
            <p className="text-xs text-slate-500">Based on your skills, goals, and accessibility preferences.</p>
          </div>
          <Link
            href="/dashboard/jobs"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition"
          >
            Explore all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="p-5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-4 transition hover:shadow-xs group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {job.workType || 'Remote · Full-time'}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    82% Match
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-700 transition">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{job.company}</p>
                </div>
                <div className="space-y-1 pt-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" /> Remote work
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" /> Screen-reader friendly
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-800">
                <span>View job</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
