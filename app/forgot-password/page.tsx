'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    const res = await forgotPassword(email);
    setSubmitting(false);

    if (res.success) {
      setMessage(res.message || 'Password reset request processed.');
      if ((res as any).devResetToken) {
        setDevToken((res as any).devResetToken);
      }
    } else {
      setError(res.error || 'Failed to process password reset.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      
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

      {/* Main Card */}
      <main className="max-w-md mx-auto w-full space-y-6 my-auto z-10 py-8">
        <div className="bg-slate-900/80 border border-slate-850 p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
          <div className="space-y-2 text-center">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Password Recovery
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white pt-1">Reset Your Password</h2>
            <p className="text-xs text-slate-400">Enter your email address to receive password reset instructions.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs space-y-2">
              <p className="font-semibold text-center">{message}</p>
              {devToken && (
                <div className="pt-2 border-t border-emerald-500/20 text-center space-y-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Local Dev Reset Token:</span>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="inline-block px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs"
                  >
                    Click to Reset Password Now
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Address
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? 'Processing...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-850 text-xs text-slate-400">
            <Link href="/login" className="text-slate-300 font-extrabold hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full text-center text-[10px] text-slate-500 z-10">
        Single-Use Token Security · Session Revocation Protection
      </footer>
    </div>
  );
}
