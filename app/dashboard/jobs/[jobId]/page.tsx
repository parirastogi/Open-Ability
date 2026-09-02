'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { matchingService } from '@/services/matching';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Sparkles, 
  HelpCircle,
  Briefcase,
  Accessibility,
  Heart
} from 'lucide-react';

export default function JobMatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // Local storage state load
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Profile
      const storedProfile = localStorage.getItem('openability_candidate');
      if (storedProfile) {
        try {
          setCandidate(JSON.parse(storedProfile));
        } catch (e) {
          console.error(e);
        }
      }
      
      // Saved state
      const saved = localStorage.getItem('openability_saved_jobs');
      if (saved) {
        try {
          setSavedJobs(JSON.parse(saved));
        } catch (e) {}
      }

      // Applied state
      const applied = localStorage.getItem('openability_applied_jobs');
      if (applied) {
        try {
          setAppliedJobs(JSON.parse(applied));
        } catch (e) {}
      }
    }
  }, []);

  const job = seedJobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Job position not found</p>
        <Link href="/dashboard/jobs" className="text-emerald-500 font-semibold text-xs mt-2 block hover:underline">
          Return to Jobs Board
        </Link>
      </div>
    );
  }

  const matchResult = matchingService.calculateMatch(
    candidate.profile,
    candidate.accessibility,
    candidate.skills,
    job
  );

  const isSaved = savedJobs.includes(job.id);
  const isApplied = appliedJobs.includes(job.id);

  const toggleSave = () => {
    let nextSaved = [...savedJobs];
    if (isSaved) {
      nextSaved = nextSaved.filter(id => id !== job.id);
    } else {
      nextSaved.push(job.id);
    }
    setSavedJobs(nextSaved);
    localStorage.setItem('openability_saved_jobs', JSON.stringify(nextSaved));
  };

  const handleApply = () => {
    if (isApplied) return;
    const nextApplied = [...appliedJobs, job.id];
    setAppliedJobs(nextApplied);
    localStorage.setItem('openability_applied_jobs', JSON.stringify(nextApplied));
    alert(`Successfully applied to ${job.title} at ${job.company}!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/jobs"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs Board
        </Link>
        
        <div className="flex gap-2">
          <button
            onClick={toggleSave}
            className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition focus:outline-none ${
              isSaved
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Job'}</span>
          </button>
          
          <button
            onClick={handleApply}
            disabled={isApplied}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-450 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition focus:outline-none"
          >
            {isApplied ? 'Applied' : 'Apply Now'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Job details & strengths (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Job Overview */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Opportunity Details
                </span>
                <h3 className="font-extrabold text-lg sm:text-xl">{job.title}</h3>
                <p className="text-xs text-slate-400">{job.company} • {job.location} • {job.salaryRange || 'Not disclosed'}</p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center shrink-0">
                <span className="text-2xl font-black text-emerald-400">{matchResult.overallScore}%</span>
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider mt-1">Match Score</span>
              </div>
            </div>
            
            <div className="flex gap-2 text-[10px]">
              <span className="bg-slate-950 px-2.5 py-1 rounded text-slate-350 font-semibold uppercase">{job.workType}</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-bold uppercase">
                Workplace Readiness: {job.accessibility?.readinessScore}%
              </span>
            </div>
          </div>

          {/* Why this job matches you */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-850 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" /> Why this job matches you
            </h3>

            {/* Strengths checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Core Match Strengths
              </h4>
              <div className="space-y-2 pl-1.5">
                {matchResult.strengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-650 dark:text-slate-300">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <p>{str}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps checklist */}
            {matchResult.skillGaps.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 animate-pulse" /> Focus Gaps & Training Areas
                </h4>
                <div className="space-y-2 pl-1.5">
                  {matchResult.skillGaps.map((gap, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-650 dark:text-slate-300">
                      <span className="text-amber-500 font-bold">!</span>
                      <p>{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Explanation block */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 italic">
              "This recommendation is based on your abilities, career goals and preferred work environment."
            </div>
          </div>

          {/* Job Description Text */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Briefcase className="w-4 h-4 text-emerald-500" /> Full Position Description
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
            
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider pt-2 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              Requirements
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
              {job.requirements}
            </p>
          </div>

        </div>

        {/* Right Side: Accessibility scoring parameters (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-emerald-500" /> Workplace Readiness
            </h3>

            {job.accessibility && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 text-white p-3 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-450">Readiness Score</span>
                  <span className="text-sm font-black text-emerald-400">{job.accessibility.readinessScore}%</span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { name: 'Remote Support', val: job.accessibility.remoteAvailable },
                    { name: 'Text Communication Options', val: job.accessibility.textCommunication },
                    { name: 'Flexible Schedules Support', val: job.accessibility.flexibleHours },
                    { name: 'Accessible Interviews', val: job.accessibility.accessibleInterview },
                    { name: 'Assistive Tech Accommodated', val: job.accessibility.assistiveTechnologySupport },
                    { name: 'Screen Reader Certified', val: job.accessibility.screenReaderCompatible },
                    { name: 'Audio Captioning Support', val: job.accessibility.captionSupport },
                    { name: 'Wheelchair Workplace Entries', val: job.accessibility.physicalAccessibility }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-50 dark:border-slate-850 pb-2">
                      <span className="text-slate-500 font-medium">{item.name}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase ${
                        item.val 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                        {item.val ? 'Yes' : 'No'}
                      </span>
                    </div>
                  ))}
                </div>

                {job.accessibility.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-450 leading-relaxed">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Accommodation Notes:</span>
                    {job.accessibility.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accessible Commute & Physical Workplace */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" /> Commute & Physical Workplace
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {job.accessibility?.verificationStatus || 'VERIFIED'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wheelchair Ramps & Entrances</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {job.accessibility?.wheelchairEntrance ? '✓ Accessible' : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Elevators & Automatic Doors</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {job.accessibility?.elevatorAccess ? '✓ Installed' : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Accessible Restrooms</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {job.accessibility?.accessibleRestrooms ? '✓ Available' : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Accessible Disability Parking</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {job.accessibility?.accessibleParking ? '✓ Reserved' : 'N/A'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Public Transit Proximity</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  {job.accessibility?.transitProximity || '5 mins walk to nearest Metro & Braille stop'}
                </p>
              </div>
            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
