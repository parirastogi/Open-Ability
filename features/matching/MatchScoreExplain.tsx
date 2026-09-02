'use client';

import React from 'react';
import { Job, MatchingEngineResult } from '@/types';
import { CheckCircle2, AlertTriangle, Info, Sparkles, Building2, HelpCircle } from 'lucide-react';

interface MatchScoreExplainProps {
  job: Job;
  matchResult: MatchingEngineResult;
}

export default function MatchScoreExplain({ job, matchResult }: MatchScoreExplainProps) {
  const {
    overallScore,
    skillScore,
    experienceScore,
    careerGoalScore,
    workPreferenceScore,
    accessibilityScore,
    strengths,
    skillGaps,
    accessibilityCompatibility,
    explanation,
    recommendation
  } = matchResult;

  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 stroke-emerald-500';
    if (score >= 70) return 'text-cyan-600 dark:text-cyan-400 stroke-cyan-500';
    return 'text-amber-600 dark:text-amber-400 stroke-amber-500';
  };

  const scoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    if (score >= 70) return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20';
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">{job.title}</h3>
              {job.accessibility?.verificationStatus && (
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                  job.accessibility.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  job.accessibility.verificationStatus === 'EMPLOYER_REPORTED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                  job.accessibility.verificationStatus === 'CANDIDATE_REPORTED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {job.accessibility.verificationStatus.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{job.company} • {job.location}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBg(overallScore)}`}>
          {overallScore}% Match
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: Score Circle & Progress Bars (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 pr-6">
          
          {/* Radial Circular Progress */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className={`transition-all duration-1000 ${scoreColor(overallScore)}`}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - overallScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
                {overallScore}%
              </span>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Overall Match</p>
            </div>
          </div>

          {/* Individual Category Progress */}
          <div className="w-full space-y-3">
            {[
              { label: 'Technical Skills', score: skillScore },
              { label: 'Experience Years', score: experienceScore },
              { label: 'Career Alignment', score: careerGoalScore },
              { label: 'Work Preference', score: workPreferenceScore },
              { label: 'Accessibility support', score: accessibilityScore },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">{cat.label}</span>
                  <span className="text-slate-800 dark:text-slate-200">{cat.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Explainers, Strengths & Gaps (7 Cols) */}
        <div className="md:col-span-7 space-y-5">
          {/* Recommendation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white">AI Compatibility Recommendation</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{recommendation}</p>
            </div>
          </div>

          {/* Strengths & Fits */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Core Match Strengths
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-normal pl-5 list-disc">
              {strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Gaps / Growth Areas */}
          {skillGaps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Potential Gaps / Training Focus
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-normal pl-5 list-disc">
                {skillGaps.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Accessibility Compatibility Checklist */}
          {job.accessibility && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" /> Accommodation Match Status
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { name: 'Remote Availability', val: job.accessibility.remoteAvailable },
                  { name: 'Flexible Schedules', val: job.accessibility.flexibleHours },
                  { name: 'Screen Reader support', val: job.accessibility.screenReaderCompatible },
                  { name: 'Audio Captions support', val: job.accessibility.captionSupport },
                  { name: 'Text Communication option', val: job.accessibility.textCommunication },
                  { name: 'Accessible Interviews', val: job.accessibility.accessibleInterview },
                  { name: 'Physical Accessibility', val: job.accessibility.physicalAccessibility },
                  { name: 'Assistive Tech Support', val: job.accessibility.assistiveTechnologySupport },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 font-medium truncate pr-1">{item.name}</span>
                    <span className={`font-bold px-1 py-0.5 rounded text-[8px] uppercase ${
                      item.val ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.val ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
