'use client';

import React from 'react';
import { demoCandidate } from '@/database/seed-data';
import { Award, AlertCircle, BookOpen, Clock, Globe, ArrowRight, TrendingUp } from 'lucide-react';

export default function SkillsPage() {
  const profile = demoCandidate.profile;
  const skills = demoCandidate.skills;

  // Mock career path data
  const targetRole = profile.targetRoles[0] || 'Accessible UI Engineer';
  const currentSkills = skills;
  const missingSkills = ['Node.js', 'PostgreSQL', 'CI/CD Pipelines (GitHub Actions)', 'GraphQL'];

  const learningPath = {
    timeline: '3 - 6 Months',
    courses: [
      { name: 'Full-Stack Node.js Developer Suite', platform: 'Udemy / Coursera', duration: '40 hours' },
      { name: 'Relational Database Design with PostgreSQL', platform: 'Pluralsight', duration: '25 hours' },
      { name: 'Introduction to CI/CD & GitHub Actions', platform: 'GitHub Learning', duration: '12 hours' }
    ],
    certifications: [
      { name: 'IAAP Web Accessibility Specialist (WAS)', difficulty: 'Intermediate', cost: 'Paid' },
      { name: 'AWS Certified Cloud Practitioner', difficulty: 'Beginner', cost: 'Paid' }
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">Skills Gap & Career Roadmap</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Compare your capabilities against your target role of <span className="font-bold text-emerald-500">{targetRole}</span>.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Skill Gap Comparison (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-850 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> Capabilities Analysis
            </h3>

            {/* Side-by-side lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Current */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Your Current Skills ({currentSkills.length})
                </span>
                <div className="flex flex-col gap-2">
                  {currentSkills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
                    >
                      ✓ {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Gaps */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Target Role Gaps ({missingSkills.length})
                </span>
                <div className="flex flex-col gap-2">
                  {missingSkills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-start gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Roadmap (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-850 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" /> Career Guidance Roadmap
            </h3>

            {/* Timeline */}
            <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-xl border border-slate-800">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Prep Timeline</span>
                <span className="font-bold">{learningPath.timeline}</span>
              </div>
            </div>

            {/* Courses list */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 block">Recommended Training Courses</span>
              <div className="space-y-2">
                {learningPath.courses.map((course, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{course.name}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {course.platform}</span>
                      <span>Duration: {course.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications list */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 block">Professional Certifications</span>
              <div className="space-y-2">
                {learningPath.certifications.map((cert, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{cert.name}</p>
                      <span className="text-[10px] text-slate-400">Difficulty: {cert.difficulty}</span>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      {cert.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
              <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                Need customized mentoring or assistance learning these gaps? Speak to your AI Companion.
              </p>
              <a 
                href="/dashboard/assistant"
                className="w-full py-2.5 bg-slate-900 dark:bg-emerald-600 dark:text-slate-950 text-white rounded-xl text-center text-xs font-bold hover:bg-slate-850 transition block"
              >
                Discuss with AI Assistant
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
