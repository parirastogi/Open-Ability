'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { useAuth } from '@/context/AuthContext';
import { 
  HeartHandshake, 
  Mic, 
  FileText, 
  Briefcase, 
  Sparkles, 
  MessageSquareText, 
  ArrowRight,
  Compass,
  LogOut
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { 
    entryState,
    status, 
    feedback, 
    startZeroTouchVoiceEntry, 
    handleVoiceModeDecision,
    handleLanguageDecision,
    handleAuthMethodDecision,
    enableVoiceMode, 
    enableTextMode, 
    selectLanguageChoice, 
    selectAuthChoice 
  } = useVoiceAgent();
  const { isAuthenticated, logout } = useAuth();

  // Automatic Speech Greeting on Mount (where browser permits)
  useEffect(() => {
    startZeroTouchVoiceEntry();

    const handleFocusPassword = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const query = new URLSearchParams({
        fullName: detail?.fullName || '',
        email: detail?.email || ''
      }).toString();
      router.push(`/signup?${query}`);
    };

    const handleFocusLoginPassword = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const query = new URLSearchParams({
        email: detail?.email || ''
      }).toString();
      router.push(`/login?${query}`);
    };

    window.addEventListener('voice-focus-password-field', handleFocusPassword);
    window.addEventListener('voice-focus-login-password-field', handleFocusLoginPassword);

    return () => {
      window.removeEventListener('voice-focus-password-field', handleFocusPassword);
      window.removeEventListener('voice-focus-login-password-field', handleFocusLoginPassword);
    };
  }, []);

  const handleStartVoice = () => {
    startZeroTouchVoiceEntry();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* AUTHORITATIVE MULTIMODAL ENTRY MODAL */}
      {(entryState === 'VOICE_MODE_QUESTION' || entryState === 'LANGUAGE_QUESTION' || entryState === 'AUTH_METHOD_QUESTION') && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-6"
          role="dialog"
          aria-labelledby="multimodal-modal-title"
          aria-live="polite"
        >
          <div className="bg-slate-900 border-2 border-emerald-500/40 p-8 sm:p-10 rounded-3xl max-w-lg w-full space-y-6 text-center shadow-2xl shadow-emerald-500/10 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Mic className={`w-7 h-7 ${status === 'LISTENING' ? 'animate-bounce text-emerald-400' : 'animate-pulse'}`} />
            </div>

            <div className="space-y-2">
              <h3 id="multimodal-modal-title" className="text-2xl font-black text-white tracking-tight">
                Hi, Welcome to OpenAbility
              </h3>
              
              {entryState === 'VOICE_MODE_QUESTION' && (
                <p className="text-base text-slate-300 font-medium">
                  Would you like to use OpenAbility with your voice?
                </p>
              )}

              {entryState === 'LANGUAGE_QUESTION' && (
                <p className="text-base text-slate-300 font-medium">
                  Would you like to continue in:
                </p>
              )}

              {entryState === 'AUTH_METHOD_QUESTION' && (
                <p className="text-base text-slate-300 font-medium">
                  Do you already have an OpenAbility account?
                </p>
              )}
            </div>

            {/* SYNCHRONIZED OPTIONS */}
            {entryState === 'VOICE_MODE_QUESTION' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleVoiceModeDecision('yes')}
                  className="py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-2xl transition shadow-lg shadow-emerald-500/20 cursor-pointer focus:ring-4 focus:ring-emerald-300"
                >
                  [ YES ]
                </button>
                <button
                  onClick={() => handleVoiceModeDecision('no')}
                  className="py-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base rounded-2xl border border-slate-700 transition cursor-pointer focus:ring-4 focus:ring-slate-400"
                >
                  [ NO ]
                </button>
              </div>
            )}

            {entryState === 'LANGUAGE_QUESTION' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleLanguageDecision('en-IN')}
                  className="py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-2xl transition shadow-lg shadow-emerald-500/20 cursor-pointer focus:ring-4 focus:ring-emerald-300"
                >
                  [ ENGLISH ]
                </button>
                <button
                  onClick={() => handleLanguageDecision('hi-IN')}
                  className="py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base rounded-2xl transition shadow-lg shadow-cyan-500/20 cursor-pointer focus:ring-4 focus:ring-cyan-300"
                >
                  [ हिंदी ]
                </button>
              </div>
            )}

            {entryState === 'AUTH_METHOD_QUESTION' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleAuthMethodDecision('LOGIN')}
                  className="py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-2xl transition shadow-lg shadow-emerald-500/20 cursor-pointer focus:ring-4 focus:ring-emerald-300"
                >
                  [ LOGIN ]
                </button>
                <button
                  onClick={() => handleAuthMethodDecision('SIGNUP')}
                  className="py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base rounded-2xl transition shadow-lg shadow-cyan-500/20 cursor-pointer focus:ring-4 focus:ring-cyan-300"
                >
                  [ SIGN UP ]
                </button>
              </div>
            )}

            <div className="pt-2 text-xs text-slate-400 font-semibold space-y-1">
              {status === 'LISTENING' ? (
                <p className="text-emerald-400 font-bold animate-pulse">
                  🎙 Listening... Say your choice or click an option.
                </p>
              ) : (
                <p>You can say your choice or select an option.</p>
              )}
              <p className="text-slate-300 text-[11px] font-medium">{feedback}</p>
            </div>

          </div>
        </div>
      )}

      {/* TOP BAR */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition cursor-pointer select-none" aria-label="OpenAbility AI Home">
          <img 
            src="/logo/logo.jpeg" 
            alt="OpenAbility AI Logo" 
            className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 group-hover:border-emerald-400 transition shadow-lg shadow-emerald-500/20" 
          />
          <div>
            <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              OpenAbility AI
            </h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Your ability. Your career. Your way.</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs font-bold text-slate-200 hover:text-white transition px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800"
              >
                Candidate Hub
              </Link>
              <button
                onClick={logout}
                className="text-xs font-bold text-slate-400 hover:text-red-400 transition px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-slate-300 hover:text-white transition px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-black text-slate-950 transition px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* MAIN CENTERED HERO HERO SECTION */}
      <main className="max-w-3xl mx-auto w-full text-center space-y-8 my-auto z-10 py-12">
        
        {/* Eyebrow */}
        <div className="inline-block">
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-[0.2em] bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            Multimodal Voice + Visual Entry System
          </span>
        </div>

        {/* Big Clean Editorial Headline */}
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
            Your ability. Your career.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">Your way.</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-xl mx-auto">
            &ldquo;How can I help you today?&rdquo;
          </p>
        </div>

        {/* Core Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleStartVoice}
            autoFocus
            aria-label="Start Voice Assistant (Press Spacebar or Tap)"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 cursor-pointer focus:ring-4 focus:ring-emerald-300 focus:outline-none"
          >
            <Mic className="w-5 h-5 text-slate-950 animate-pulse" />
            Start Voice Assistant (Press Space or Tap)
          </button>

          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-extrabold text-sm rounded-2xl transition flex items-center justify-center gap-2"
          >
            <MessageSquareText className="w-4 h-4 text-emerald-400" />
            Use Text Interface
          </Link>
        </div>

        {/* 4 Core Direct Pathways */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-8">
          {[
            { label: 'Find Jobs', href: '/dashboard/jobs', icon: Briefcase, color: 'text-emerald-400' },
            { label: 'Build Resume', href: '/dashboard/resume', icon: FileText, color: 'text-cyan-400' },
            { label: 'Career Plan', href: '/dashboard/skills', icon: Compass, color: 'text-teal-400' },
            { label: 'Mock Interview', href: '/dashboard/interview', icon: Sparkles, color: 'text-emerald-300' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="p-4 bg-slate-900/60 border border-slate-855 hover:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition hover:-translate-y-0.5"
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs font-bold text-slate-300">{item.label}</span>
              </Link>
            );
          })}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto w-full text-center text-[11px] text-slate-500 z-10">
        OpenAbility AI · Designed for persons with disabilities · Indian English (`en-IN`) Voice Engine Active
      </footer>

    </div>
  );
}
