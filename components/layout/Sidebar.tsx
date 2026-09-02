'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Award, 
  Briefcase, 
  Mic, 
  X,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
}

const navItems: SidebarItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, description: 'Career Hub' },
  { name: 'My Profile', href: '/dashboard/profile', icon: User, description: 'Accommodations' },
  { name: 'Resume', href: '/dashboard/resume', icon: FileText, description: 'Builder & Scanner' },
  { name: 'Jobs Board', href: '/dashboard/jobs', icon: Briefcase, description: 'Ability Matching' },
  { name: 'Career & Skills', href: '/dashboard/skills', icon: Award, description: 'Roadmaps' },
  { name: 'Mock Interview', href: '/dashboard/interview', icon: Mic, description: 'Voice Practice' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [candidateName, setCandidateName] = React.useState('Candidate');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('openability_candidate');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.profile?.fullName) {
            setCandidateName(data.profile.fullName);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const initials = candidateName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'OA';

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full select-none border-r border-slate-800/80 shadow-lg" aria-label="Dashboard navigation">
      
      {/* Brand Logo Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-95 transition cursor-pointer" aria-label="Go to Home page">
          <img 
            src="/logo/logo.jpeg" 
            alt="OpenAbility AI Logo" 
            className="w-8.5 h-8.5 rounded-xl object-cover border border-teal-500/30" 
          />
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              OpenAbility <span className="text-teal-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Inclusive Career Companion</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                isActive
                  ? 'bg-slate-800 text-white font-bold border-l-4 border-teal-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-850 hover:text-white border-l-4 border-transparent font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="text-xs sm:text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <Link href="/dashboard/profile" className="flex items-center gap-3 group hover:opacity-90 transition">
          <div className="w-9 h-9 rounded-full bg-teal-600 border border-teal-400/40 flex items-center justify-center font-bold text-white uppercase text-xs shadow-sm">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-xs text-slate-100 truncate group-hover:text-teal-300 transition-colors">{candidateName}</p>
            <p className="text-[10px] text-slate-400 truncate">Candidate Account</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
