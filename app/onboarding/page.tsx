'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { 
  HeartHandshake, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Mic,
  Volume2
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

interface SkillItem {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export default function OnboardingPage() {
  const router = useRouter();
  const auth = useAuth();
  const { 
    startVoiceOnboarding, 
    startAgentListening, 
    stopAgentListening, 
    onboardingStep, 
    feedback, 
    transcript, 
    status 
  } = useVoiceAgent();
  const [step, setStep] = useState(1);

  // STEP 1: Basic Profile (Pre-filled from Signup)
  const [fullName, setFullName] = useState(auth.user?.fullName || '');
  const [email, setEmail] = useState(auth.user?.email || '');
  const [education, setEducation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [targetCareer, setTargetCareer] = useState('');
  const [preferredJobTitles, setPreferredJobTitles] = useState('');

  useEffect(() => {
    if (auth.user?.fullName) setFullName(auth.user.fullName);
    if (auth.user?.email) setEmail(auth.user.email);
  }, [auth.user]);

  // STEP 2: Skills
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: 'React', level: 'Intermediate' },
    { name: 'TypeScript', level: 'Intermediate' }
  ]);
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');

  // STEP 3: Communication Preferences
  const [commPrefs, setCommPrefs] = useState<string[]>(['TEXT']);

  // STEP 4: Accessibility Support Preferences
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [textCommunication, setTextCommunication] = useState(false);
  const [flexibleHours, setFlexibleHours] = useState(false);
  const [remoteWork, setRemoteWork] = useState(false);
  const [physicalWorkplace, setPhysicalWorkplace] = useState(false);
  const [accessibleInterview, setAccessibleInterview] = useState(true);
  const [assistiveTech, setAssistiveTech] = useState(false);
  const [otherAccommodation, setOtherAccommodation] = useState('');

  // STEP 5: Work Preferences
  const [workPrefs, setWorkPrefs] = useState<string[]>(['REMOTE']);

  // Success screen trigger
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Listen to voice actions for form filling and selection
  useEffect(() => {
    const handleVoiceFill = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.name) {
        setFullName(detail.name);
        setStep(1);
      }
      if (detail.email) {
        setEmail(detail.email);
        setStep(1);
      }
      if (detail.education) {
        setEducation(detail.education);
        setStep(1);
      }
      if (detail.careerGoal) {
        setTargetCareer(detail.careerGoal);
        setStep(1);
      }
    };

    const handleVoiceSelectPref = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.workPreference) {
        setWorkPrefs([detail.workPreference]);
        setStep(5);
        if (detail.workPreference === 'REMOTE') {
          setRemoteWork(true);
        }
      }
      if (detail.communicationPreference) {
        setCommPrefs([detail.communicationPreference]);
        setStep(3);
      }
    };

    const handleVoiceSelectAcc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const opt = detail.option;
      setStep(4);
      if (opt === 'screenReaderRequired') setScreenReader(prev => !prev);
      if (opt === 'keyboardNavigationOnly') setKeyboardNavigation(prev => !prev);
      if (opt === 'captionsRequired') setCaptions(prev => !prev);
      if (opt === 'textCommunicationOnly') setTextCommunication(prev => !prev);
      if (opt === 'flexibleHours') setFlexibleHours(prev => !prev);
      if (opt === 'remoteWork') setRemoteWork(prev => !prev);
      if (opt === 'accessiblePhysicalSpace') setPhysicalWorkplace(prev => !prev);
      if (opt === 'accessibleInterview') setAccessibleInterview(prev => !prev);
      if (opt === 'assistiveTech') setAssistiveTech(prev => !prev);
    };

    window.addEventListener('voice-fill-profile', handleVoiceFill);
    window.addEventListener('voice-select-preference', handleVoiceSelectPref);
    window.addEventListener('voice-select-accommodation', handleVoiceSelectAcc);

    return () => {
      window.removeEventListener('voice-fill-profile', handleVoiceFill);
      window.removeEventListener('voice-select-preference', handleVoiceSelectPref);
      window.removeEventListener('voice-select-accommodation', handleVoiceSelectAcc);
    };
  }, []);

  // Form validations for Step 1
  const isStep1Valid = fullName.trim() !== '' && email.trim() !== '' && targetCareer.trim() !== '';

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.some(s => s.name.toLowerCase() === skillInput.trim().toLowerCase())) {
      setSkills(prev => [...prev, { name: skillInput.trim(), level: skillLevel }]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCommPref = (pref: string) => {
    setCommPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const toggleWorkPref = (pref: string) => {
    setWorkPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  // Safe navigation helpers
  const handleNext = () => {
    if (step === 1 && !isStep1Valid) return;
    setStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Submit and persist
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Build accommodations array list
    const accommodations: string[] = [];
    if (screenReader) accommodations.push('Screen Reader Compatibility');
    if (keyboardNavigation) accommodations.push('Keyboard Only Navigation');
    if (captions) accommodations.push('Captions for Video Calls');
    if (textCommunication) accommodations.push('Text Only Asynchronous Chat');
    if (flexibleHours) accommodations.push('Flexible Work Schedules');
    if (remoteWork) accommodations.push('Fully Remote Option');
    if (physicalWorkplace) accommodations.push('Wheelchair Physical Access');
    if (accessibleInterview) accommodations.push('Accessible Online Interview');
    if (assistiveTech) accommodations.push('Assistive Tech Inputs');
    if (otherAccommodation.trim()) accommodations.push(otherAccommodation.trim());

    const finalRoles = preferredJobTitles ? preferredJobTitles.split(',').map(s => s.trim()) : [targetCareer || 'Software Developer'];
    const finalSkills = skills.map(s => s.name);

    const profileData = {
      fullName,
      targetRoles: finalRoles,
      experienceYears: Number(experienceYears),
      education: education || 'Higher Education Candidate',
      onboardingCompleted: true,
      onboardingStep: 'COMPLETE',
      skills: finalSkills
    };

    const accData = {
      communicationPreference: commPrefs[0] || 'VOICE',
      screenReaderRequired: screenReader,
      captionsRequired: captions,
      textCommunicationOnly: textCommunication,
      workPreference: workPrefs[0] || 'REMOTE',
      sharingPreferences: false,
      accommodations
    };

    Promise.all([
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      }),
      fetch('/api/user/accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accData)
      })
    ]).then(() => {
      auth.setOnboardingState(true, 'COMPLETE');
      setSubmitting(false);
      setSuccess(true);
    }).catch((err) => {
      console.error(err);
      auth.setOnboardingState(true, 'COMPLETE');
      setSubmitting(false);
      setSuccess(true);
    });
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Steps headers list
  const stepsList = [
    { num: 1, label: 'Profile' },
    { num: 2, label: 'Skills' },
    { num: 3, label: 'Communication' },
    { num: 4, label: 'Support' },
    { num: 5, label: 'Preferences' },
    { num: 6, label: 'Review' }
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
      
      {/* Decorative spotlights */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-900 pb-4 z-10 shrink-0">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition cursor-pointer select-none" aria-label="Go to Home page">
          <img 
            src="/logo/logo.jpeg" 
            alt="OpenAbility AI Logo" 
            className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30 group-hover:border-emerald-400 transition" 
          />
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              OpenAbility AI
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Inclusive Onboarding</p>
          </div>
        </Link>
        <div className="text-xs text-slate-400 font-semibold bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          Step {step} of 6
        </div>
      </header>

      {/* Voice-First Onboarding Prompt Card */}
      <div className="max-w-xl mx-auto w-full bg-emerald-500/10 border border-emerald-500/30 p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 mt-4 text-xs shadow-lg">
        <div className="space-y-1">
          <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Voice-First Onboarding Mode
          </span>
          <p className="text-slate-300 text-xs">
            Blind or visually impaired? Set up your profile completely through natural voice conversation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            startVoiceOnboarding();
          }}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shrink-0 transition shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Mic className="w-4 h-4 text-slate-950 animate-pulse" /> Start Voice Profile
        </button>
      </div>

      {/* Active Voice Onboarding Console Overlay */}
      {onboardingStep !== 'OFF' && (
        <div className="max-w-xl mx-auto w-full bg-slate-900 border-2 border-emerald-500 p-6 rounded-3xl z-20 mt-4 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-widest">
                Voice Assistant Active — Step: {onboardingStep}
              </span>
            </div>
            <button
              onClick={stopAgentListening}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Assistant Spoke</span>
            <p className="text-sm font-bold text-emerald-300 leading-relaxed">
              {feedback || "Listening to your answer..."}
            </p>
          </div>

          {transcript && (
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">You Said</span>
              <p className="text-xs font-semibold text-slate-200">{transcript}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={startAgentListening}
              className={`flex-1 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                status === 'LISTENING' 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-750 text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              {status === 'LISTENING' ? 'Listening... Speak Now' : 'Tap to Speak Answer'}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal Screen Override */}
      {success ? (
        <div className="flex-1 flex items-center justify-center py-8 z-20">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/35 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Profile Created Successfully!</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Welcome {fullName}! OpenAbility AI has successfully calculated your job compatibility rates and configured your companion assistant.
              </p>
            </div>
            <button
              onClick={handleGoToDashboard}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Go to Workspace Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Standard wizard forms */
        <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10 z-10 w-full">
          
          {/* Progress Indicator */}
          <div className="w-full max-w-xl mb-8 overflow-x-auto scrollbar-none pb-2">
            <div className="flex justify-between items-center min-w-[500px] px-2">
              {stepsList.map((s, idx) => (
                <div key={s.num} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition ${
                      step >= s.num 
                        ? 'bg-emerald-500 text-slate-950 font-extrabold' 
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}>
                      {s.num}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      step >= s.num ? 'text-slate-200' : 'text-slate-550'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 5 && (
                    <ChevronRight className="w-4 h-4 text-slate-800 mx-2 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Container */}
          <div className="w-full max-w-xl bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Step 1: Basic Profile */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">Basic Profile</h2>
                  <p className="text-xs text-slate-400">Tell us your background and career goals.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Anshul Pandey"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex.rivera@example.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Education Details</label>
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="B.S. in Computer Science"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Current Role / Status</label>
                      <input
                        type="text"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="Frontend Developer"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Target Career *</label>
                      <input
                        type="text"
                        value={targetCareer}
                        onChange={(e) => setTargetCareer(e.target.value)}
                        placeholder="e.g. Accessible UI Engineer"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Preferred Job Titles (Comma-separated)</label>
                    <input
                      type="text"
                      value={preferredJobTitles}
                      onChange={(e) => setPreferredJobTitles(e.target.value)}
                      placeholder="UI Engineer, React Specialist, Frontend Architect"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">Extracted Capabilities</h2>
                  <p className="text-xs text-slate-400">Declare coding, systems or styling skills and proficiency levels.</p>
                </div>

                {/* Form to add */}
                <form onSubmit={addSkill} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. React, Tailwind, Python"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                  />
                  <select
                    value={skillLevel}
                    onChange={(e: any) => setSkillLevel(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-bold text-white border border-slate-800 flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>

                {/* Skill chips */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-500 block">Your Added Skills ({skills.length})</span>
                  
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                    {skills.map((item, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-slate-800 text-slate-350 bg-slate-900/60"
                      >
                        <span>{item.name}</span>
                        <span className="text-[9px] bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider">
                          {item.level}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          className="text-slate-500 hover:text-red-500 transition font-bold"
                          title="Remove Skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Communication Preferences */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">Communication Preferences</h2>
                  <p className="text-xs text-slate-400">How would you like OpenAbility AI to communicate with you?</p>
                </div>

                <div className="space-y-3 pt-4">
                  {[
                    { id: 'VOICE', name: 'Voice Interface', desc: 'Integrated screen reading, voice guidance, and audio mock readouts.' },
                    { id: 'TEXT', name: 'Text Interface', desc: 'Typed prompts, asynchronous checklists, and transcription logs.' },
                    { id: 'SIGN_LANGUAGE', name: 'Sign Language Interface', desc: 'Camera video skeletal gesture models and avatar prototypes.' }
                  ].map((item) => {
                    const active = commPrefs.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCommPref(item.id)}
                        className={`p-4 border rounded-2xl cursor-pointer transition select-none flex justify-between items-center ${
                          active
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : 'border-slate-850 bg-slate-900/20 hover:border-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5 pr-4">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-200">{item.name}</h4>
                          <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          active ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-700'
                        }`}>
                          {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Accessibility Support Preferences */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">Support Preferences</h2>
                  <p className="text-xs text-slate-400">What workplace support helps you perform at your best?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-[300px] overflow-y-auto pr-1">
                  {[
                    { name: 'screenReader', label: 'Screen reader compatibility', val: screenReader, setter: setScreenReader },
                    { name: 'keyboardNavigation', label: 'Keyboard navigation', val: keyboardNavigation, setter: setKeyboardNavigation },
                    { name: 'captions', label: 'Captions support', val: captions, setter: setCaptions },
                    { name: 'textCommunication', label: 'Text communication options', val: textCommunication, setter: setTextCommunication },
                    { name: 'flexibleHours', label: 'Flexible working hours', val: flexibleHours, setter: setFlexibleHours },
                    { name: 'remoteWork', label: 'Remote work options', val: remoteWork, setter: setRemoteWork },
                    { name: 'physicalWorkplace', label: 'Accessible physical workplace', val: physicalWorkplace, setter: setPhysicalWorkplace },
                    { name: 'accessibleInterview', label: 'Accessible interview processes', val: accessibleInterview, setter: setAccessibleInterview },
                    { name: 'assistiveTech', label: 'Assistive technology support', val: assistiveTech, setter: setAssistiveTech }
                  ].map((item) => (
                    <label 
                      key={item.name} 
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition ${
                        item.val 
                          ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300' 
                          : 'border-slate-850 bg-slate-900/30 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.val}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-emerald-500 bg-slate-900 focus:ring-emerald-400 focus:outline-none shrink-0"
                      />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <label className="text-xs font-bold text-slate-400">Other Accommodation (Write-in)</label>
                  <input
                    type="text"
                    value={otherAccommodation}
                    onChange={(e) => setOtherAccommodation(e.target.value)}
                    placeholder="e.g. Ergonomic chair setup, custom screen distance filters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white placeholder-slate-600"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Work Environment Preferences */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">Work Environment Preferences</h2>
                  <p className="text-xs text-slate-400">Select preferred office setup types (Multiple preferences allowed).</p>
                </div>

                <div className="space-y-3 pt-4">
                  {[
                    { id: 'REMOTE', name: 'Fully Remote', desc: 'Work from home or outside the physical office.' },
                    { id: 'HYBRID', name: 'Hybrid Model', desc: 'Balance between home and designated team office sites.' },
                    { id: 'OFFICE', name: 'Office Placement', desc: 'Onsite desk environments.' },
                    { id: 'FLEXIBLE', name: 'Flexible Pacing', desc: 'Schedules adjusted to support sensory pacing needs.' }
                  ].map((item) => {
                    const active = workPrefs.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleWorkPref(item.id)}
                        className={`p-4 border rounded-2xl cursor-pointer transition select-none flex justify-between items-center ${
                          active
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : 'border-slate-855 bg-slate-900/20 hover:border-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-200">{item.name}</h4>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          active ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-750'
                        }`}>
                          {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <div className="space-y-5 animate-in fade-in duration-150 max-h-[380px] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">Review Profile Summary</h2>
                  <p className="text-xs text-slate-400">Confirm details before establishing your candidate workspace.</p>
                </div>

                <div className="space-y-4 pt-2 text-xs leading-normal">
                  {/* Basic Profile */}
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Basic Profile</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <p><span className="font-bold text-slate-400">Name:</span> {fullName}</p>
                      <p><span className="font-bold text-slate-400">Email:</span> {email}</p>
                      <p><span className="font-bold text-slate-400">Target Role:</span> {targetCareer}</p>
                      <p><span className="font-bold text-slate-400">Experience:</span> {experienceYears} yrs</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Added Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg">
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Communication & Workspace */}
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Preferences</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-350">
                      <p><span className="font-bold text-slate-400">Communication Prefer:</span> {commPrefs.join(', ')}</p>
                      <p><span className="font-bold text-slate-400">Work Preferences:</span> {workPrefs.join(', ')}</p>
                    </div>
                  </div>

                  {/* Accommodations checklist summary */}
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Sensory Support Preferences</span>
                    <div className="flex flex-wrap gap-1.5">
                      {screenReader && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Screen reader compat</span>}
                      {keyboardNavigation && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Keyboard navigation</span>}
                      {captions && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Captions</span>}
                      {textCommunication && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Text only comm</span>}
                      {flexibleHours && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Flexible hours</span>}
                      {remoteWork && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Remote work</span>}
                      {physicalWorkplace && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Wheelchair Access</span>}
                      {accessibleInterview && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Accessible interview</span>}
                      {assistiveTech && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Assistive technology</span>}
                      {otherAccommodation.trim() && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">{otherAccommodation}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-900">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 1 && !isStep1Valid}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  Continue <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg shadow-emerald-500/10 flex items-center justify-center min-w-[150px]"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <span>Create My Career Profile</span>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-500 pt-4 z-10 shrink-0">
        OpenAbility AI conforms to standard visual guidelines and protects candidate metadata.
      </footer>
    </div>
  );
}
