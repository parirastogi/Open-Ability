'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  AlertCircle,
  User,
  Award,
  Accessibility,
  TrendingUp,
  HelpCircle,
  FileText,
  Briefcase
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  // Load candidate profile dynamically from localStorage
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Hello! I am your OpenAbility Career Companion. Review your stats on the right and ask me questions about jobs, skills gaps, or learning paths." }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('openability_candidate');
      if (stored) {
        try {
          setCandidate(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean speech synthesis if leaving page
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  // Streaming typewriter animation helper
  const simulateStreaming = (fullText: string) => {
    setIsTyping(true);
    let currentText = '';
    const words = fullText.split(' ');
    let idx = 0;
    
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: lastUserMessage }]); // wait, user message was already added in handleSend
    
    // Add typing slot
    setMessages(prev => {
      // Find and remove if duplicate user message exists or just append assistant slot
      return [...prev, { id: tempId, role: 'assistant', content: '' }];
    });

    const interval = setInterval(() => {
      if (idx < words.length) {
        currentText += (idx === 0 ? '' : ' ') + words[idx];
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, content: currentText } : m));
        idx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (ttsEnabled) {
          speechService.speak(fullText);
        }
      }
    }, 30);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (isListening) {
      stopListening();
    }

    setError(null);
    setLastUserMessage(textToSend);
    
    // Append User Message
    const userMsgId = 'user-' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: textToSend }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.chatWithAssistant(
        textToSend,
        {
          fullName: candidate.profile.fullName,
          skills: candidate.skills,
          accessibility: candidate.accessibility
        },
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      // Trigger typewriter effect
      setIsTyping(false);
      simulateStreaming(response);
    } catch (e) {
      setError('Connection to AI service failed. Would you like to retry?');
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSend(lastUserMessage);
    }
  };

  const startListening = () => {
    setIsListening(true);
    speechService.startListening(
      (result) => {
        setInput(result);
        setIsListening(false);
        handleSend(result);
      },
      (error) => {
        console.error(error);
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const profile = candidate.profile;
  const access = candidate.accessibility;
  const skills = candidate.skills;

  // Mock gaps for side-panel representation
  const targetCareer = profile.targetRoles[0] || 'Accessible UI Engineer';
  const gaps = ['Node.js', 'PostgreSQL', 'Docker', 'AWS'];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">AI Career Companion</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Have a contextual discussion about your skills, gaps, and job compatibility options.
        </p>
      </div>

      {/* Main Grid: Left Conversation, Right Context Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Conversation (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col h-[580px] overflow-hidden shadow-sm">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm">Interactive Session</h3>
                <span className="text-[10px] text-slate-400">Context: {profile.fullName}</span>
              </div>
            </div>
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                ttsEnabled 
                  ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' 
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{ttsEnabled ? 'Voice Aloud: On' : 'Voice Aloud: Off'}</span>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm text-sm text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400 text-xs flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions / Shortcuts Panel */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
              { text: "Analyze my resume", icon: FileText },
              { text: "Find jobs for me", icon: Briefcase },
              { text: "What skills am I missing?", icon: Award },
              { text: "Build my learning roadmap", icon: TrendingUp },
              { text: "Prepare for interview", icon: Mic },
              { text: "Why was this job recommended?", icon: HelpCircle }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.text)}
                className="text-[10px] font-bold text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition focus:outline-none"
              >
                <action.icon className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{action.text}</span>
              </button>
            ))}
          </div>

          {/* Message Input Footer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition flex items-center justify-center shrink-0 border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                isListening 
                  ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
              }`}
              title={isListening ? "Stop listening" : "Record voice response"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your candidate path..."
              className="flex-1 text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 dark:text-slate-950 text-white hover:bg-slate-850 disabled:opacity-50 text-xs font-bold transition focus:outline-none"
            >
              Send Message
            </button>
          </form>

        </div>

        {/* Right Column: Career Context Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" /> Career Context
            </h3>

            {/* Candidate summary */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-400 block">Candidate Profile</span>
              <p className="font-bold text-slate-800 dark:text-white">{profile.fullName}</p>
              <p className="text-slate-500 mt-1 leading-normal">{profile.bio}</p>
            </div>

            {/* Target goals */}
            <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-850">
              <span className="font-bold text-slate-400 block">Target Career Roles</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.targetRoles.map((role: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-md font-semibold text-[10px] text-slate-600 dark:text-slate-400">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Skills list */}
            <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-850">
              <span className="font-bold text-slate-400 block">Skills Extracted ({skills.length})</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-850">
              <span className="font-bold text-slate-400 block">Identified Skill Gaps ({gaps.length})</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {gaps.map((gap, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-700 dark:text-amber-400 font-bold uppercase">
                    {gap}
                  </span>
                ))}
              </div>
            </div>

            {/* Accessibility settings */}
            <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-850">
              <span className="font-bold text-slate-400 block">Workspace Support Preferences</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {access.accommodations.map((acc: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                    {acc}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
