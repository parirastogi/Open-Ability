'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { demoCandidate } from '@/database/seed-data';
import { PostHiringAccommodation } from '@/types';
import { 
  Building2, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Award,
  Send,
  Download,
  PlusCircle,
  Briefcase
} from 'lucide-react';

export default function WorkplaceCompanionPage() {
  const [candidate, setCandidate] = useState(demoCandidate);
  const [accommodations, setAccommodations] = useState<PostHiringAccommodation[]>([
    {
      id: 'acc-req-1',
      candidateProfileId: 'cand-demo',
      title: 'NVDA & JAWS Enterprise Screen Reader Software License',
      category: 'ASSISTIVE_TECH',
      status: 'APPROVED',
      details: 'Full enterprise license for NVDA and JAWS screen readers on work laptop.',
      requestedAt: '2026-08-15'
    },
    {
      id: 'acc-req-2',
      candidateProfileId: 'cand-demo',
      title: 'Asynchronous Text-Based Standup Communication Option',
      category: 'COMMUNICATION',
      status: 'COMPLETED',
      details: 'Option to submit daily standups via Slack/Teams text channels instead of mandatory audio calls.',
      requestedAt: '2026-08-18'
    },
    {
      id: 'acc-req-3',
      candidateProfileId: 'cand-demo',
      title: 'Adjustable Standing Ergonomic Desk & Braille Monitor Mount',
      category: 'PHYSICAL_SPACE',
      status: 'IN_PROGRESS',
      details: 'Electric height-adjustable desk installed on Floor 3 near main elevators.',
      requestedAt: '2026-08-25'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'ASSISTIVE_TECH' | 'PHYSICAL_SPACE' | 'FLEXIBLE_WORK' | 'COMMUNICATION'>('ASSISTIVE_TECH');
  const [newDetails, setNewDetails] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('openability_candidate');
      if (stored) {
        try { setCandidate(JSON.parse(stored)); } catch (e) {}
      }
    }
  }, []);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const req: PostHiringAccommodation = {
      id: `acc-req-${Date.now()}`,
      candidateProfileId: candidate.profile.id,
      title: newTitle,
      category: newCategory,
      status: 'REQUESTED',
      details: newDetails || 'Official workplace accommodation request generated via OpenAbility AI.',
      requestedAt: new Date().toISOString().split('T')[0]
    };

    setAccommodations([req, ...accommodations]);
    
    // Generate letter
    const letter = `OFFICIAL WORKPLACE ACCOMMODATION REQUEST
--------------------------------------------------
Date: ${new Date().toLocaleDateString()}
To: People Operations & HR Department
From: ${candidate.profile.fullName}
Role: ${candidate.profile.targetRoles[0] || 'Software Engineer'}

Subject: Workplace Accommodation Request — ${newTitle}

Dear HR Team,

I am writing to formally request a workplace accommodation under our company's inclusion policy.

Requested Item / Arrangement:
${newTitle} (${newCategory.replace('_', ' ')})

Details & Business Context:
${newDetails || 'This accommodation ensures equal access to internal digital and physical systems, enabling optimal productivity and collaboration.'}

Thank you for supporting an accessible and inclusive workspace.

Sincerely,
${candidate.profile.fullName}`;

    setGeneratedLetter(letter);
    setNewTitle('');
    setNewDetails('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-500" /> Post-Hiring Workplace Companion
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Continuous support for workplace accommodations, internal accessibility processes, and promotion pathways.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 shrink-0">
          <CheckCircle2 className="w-4 h-4" /> Active Employment Support
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Accommodation Request Generator & List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Create Request Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <PlusCircle className="w-4 h-4 text-emerald-500" /> Request Workplace Accommodation
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Accommodation Title
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ergonomic chair, NVDA screen reader license, flexible standup time..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select 
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="ASSISTIVE_TECH">Assistive Technology</option>
                    <option value="PHYSICAL_SPACE">Physical Workplace</option>
                    <option value="FLEXIBLE_WORK">Flexible Schedule</option>
                    <option value="COMMUNICATION">Communication Mode</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Date
                  </label>
                  <input 
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString()}
                    className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Additional Context & Justification
                </label>
                <textarea 
                  rows={3}
                  placeholder="Describe how this accommodation assists your daily tasks..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Generate Formal HR Request Letter
              </button>
            </form>
          </div>

          {/* Generated Letter Output */}
          {generatedLetter && (
            <div className="bg-slate-950 text-emerald-400 border border-emerald-500/30 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-white">
                  <FileText className="w-4 h-4 text-emerald-400" /> Generated Accommodation Letter
                </h4>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedLetter)}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Copy Letter Text
                </button>
              </div>
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-300">
                {generatedLetter}
              </pre>
            </div>
          )}

          {/* Existing Accommodations Tracker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Clock className="w-4 h-4 text-emerald-500" /> Active Workplace Accommodations Tracker
            </h3>

            <div className="space-y-3">
              {accommodations.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-xs text-slate-800 dark:text-white">{item.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 border ${
                      item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                      item.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">{item.details}</p>
                  <span className="text-[9px] text-slate-400 font-medium block pt-1">
                    Requested on: {item.requestedAt} • Category: {item.category.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Career Growth & Promotion Roadmap (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Promotion & Skill Growth Roadmap */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Career Growth & Promotion Path
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Target Next Promotion Goal
                </span>
                <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">Senior Accessible UI Engineer</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Estimated Timeline: 12 - 18 Months</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skill Growth Milestones</h4>
                {[
                  { name: 'Lead WCAG 2.1 AAA Accessibility Audits', done: true },
                  { name: 'Architect Reusable Accessible Design System Tokens', done: true },
                  { name: 'Mentorship of Junior Frontend Developers', done: false },
                  { name: 'IAAP Web Accessibility Specialist Certification', done: false }
                ].map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    <span className={m.done ? "text-emerald-500 font-bold" : "text-slate-300 font-bold"}>
                      {m.done ? '✓' : '○'}
                    </span>
                    <span className={m.done ? "text-slate-800 dark:text-white font-medium" : "text-slate-400"}>
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Internal Onboarding Guide */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> Internal Onboarding Companion
            </h3>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
              <li>Request screen reader license through internal IT ticket portal.</li>
              <li>Configure Slack / Teams captions for live company all-hands.</li>
              <li>Schedule quarterly accessibility accommodation review with People Ops.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
