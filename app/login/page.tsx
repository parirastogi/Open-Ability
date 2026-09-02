'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { HeartHandshake, Lock, Mail, ArrowRight, Volume2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { speakFeedback } = useVoiceAgent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Spoken Indian English Voice Greeting on Mount & Query Auto-fill
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qEmail = params.get('email');
      if (qEmail) {
        setEmail(qEmail);
        setTimeout(() => {
          document.getElementById('password')?.focus();
        }, 500);
      }
    }

    const greeting = "Hello, welcome back to OpenAbility. Please enter your registered email and password to log in. For security, password entry should be typed in the password field.";
    const timer = setTimeout(() => {
      speakFeedback(greeting);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials.');
      speakFeedback(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      
      {/* Spotlight Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group" aria-label="Go to Home">
          <img src="/logo/logo.jpeg" alt="OpenAbility AI Logo" className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30 group-hover:border-emerald-400 transition" />
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              OpenAbility AI
            </h1>
            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Your ability. Your career. Your way.</p>
          </div>
        </Link>
      </header>

      {/* Login Card */}
      <main className="max-w-md mx-auto w-full space-y-6 my-auto z-10 py-8">
        
        <div className="bg-slate-900/80 border border-slate-850 p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
          <div className="space-y-2 text-center">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Welcome Back
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white pt-1">Log in to OpenAbility</h2>
            <p className="text-xs text-slate-400">Access your saved career profile, resume, and interview history.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-center animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Address <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white font-medium placeholder-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Password <span className="text-emerald-400">*</span>
                </label>
                <Link href="/forgot-password" className="text-[10px] text-emerald-400 font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white font-medium placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? 'Authenticating...' : 'Log In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-850 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-emerald-400 font-extrabold hover:underline">
              Create Account
            </Link>
          </div>
        </div>

      </main>

      <footer className="max-w-md mx-auto w-full text-center text-[10px] text-slate-500 z-10">
        HttpOnly Session Security · Server Derived Authentication
      </footer>
    </div>
  );
}
