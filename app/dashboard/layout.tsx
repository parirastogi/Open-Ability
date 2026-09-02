'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import AccessibilityControls from '@/components/layout/AccessibilityControls';
import PersistentAssistant from '@/features/assistant/PersistentAssistant';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, Menu, LogOut, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { candidate } = useVoiceAgent();
  const { logout } = useAuth();

  const fullName = candidate.profile?.fullName || 'Candidate';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'C';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out lg:flex shrink-0`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile Backdrop Mask */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sleek Top Header Navigation */}
        <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-25 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 lg:hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <Link href="/" className="flex items-center gap-2 md:hidden hover:opacity-90 transition cursor-pointer" aria-label="Go to Home page">
              <img src="/logo/logo.jpeg" alt="OpenAbility AI Logo" className="w-7 h-7 rounded-lg object-cover border border-teal-500/30" />
            </Link>
            
            <div className="hidden md:flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                Candidate Workspace
              </h2>
              <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" /> Non-Discriminatory Audit Passed
              </span>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-3">
            <AccessibilityControls />

            <button
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-teal-400 relative"
              aria-label="Notification center"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
            </button>

            <div className="h-5 w-px bg-slate-200" />

            {/* Candidate Avatar Badge */}
            <Link 
              href="/dashboard/profile"
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-all duration-200 cursor-pointer group"
              title="View & Edit Profile"
            >
              <span className="text-xs font-bold text-slate-700 hidden sm:inline group-hover:text-teal-700 transition-colors">
                {fullName}
              </span>
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white uppercase text-xs shadow-xs group-hover:scale-105 transition-transform">
                {initials}
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition focus:outline-none"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Ask OpenAbility Assistant Button (voice logic intact) */}
      <PersistentAssistant />
    </div>
  );
}
