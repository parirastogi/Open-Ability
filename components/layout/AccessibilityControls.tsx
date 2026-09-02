'use client';

import React, { useState, useEffect } from 'react';
import { accessibilityService } from '@/services/accessibility';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { Eye, Type, Volume2, Keyboard, Check, Mic } from 'lucide-react';

export default function AccessibilityControls() {
  const { voiceFirstMode, setVoiceFirstMode } = useVoiceAgent();
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Sync with DOM classes on mount / update
    accessibilityService.applyProfile({
      highContrastRequired: highContrast,
      largeTextRequired: largeText,
      keyboardNavigationOnly: keyboardNav,
    });
  }, [highContrast, largeText, keyboardNav]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleLargeText = () => setLargeText(prev => !prev);
  const toggleSound = () => setSoundEnabled(prev => !prev);
  const toggleKeyboardNav = () => setKeyboardNav(prev => !prev);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition"
        aria-label="Accessibility settings"
        aria-expanded={open}
      >
        <Eye className="w-4 h-4" />
        <span>Accessibility</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Accessibility Preferences</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setVoiceFirstMode(!voiceFirstMode)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm font-medium transition ${
                voiceFirstMode 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' 
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-xs">Voice-First Mode</div>
                  <div className="text-[10px] text-slate-400">Speak & listen career navigation</div>
                </div>
              </div>
              {voiceFirstMode && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
            </button>
            <button
              onClick={toggleHighContrast}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm font-medium transition ${
                highContrast 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' 
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <div>
                  <div className="font-semibold">High Contrast</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Increase readability colors</div>
                </div>
              </div>
              {highContrast && <Check className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              onClick={toggleLargeText}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm font-medium transition ${
                largeText 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' 
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <div>
                  <div className="font-semibold">Large Text</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Increase application font scale</div>
                </div>
              </div>
              {largeText && <Check className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              onClick={toggleKeyboardNav}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm font-medium transition ${
                keyboardNav 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' 
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                <div>
                  <div className="font-semibold">Keyboard Focus</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Optimize keyboard nav borders</div>
                </div>
              </div>
              {keyboardNav && <Check className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              onClick={toggleSound}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm font-medium transition ${
                soundEnabled 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' 
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <div>
                  <div className="font-semibold">Audio Prompts</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Enable voice assistance guidance</div>
                </div>
              </div>
              {soundEnabled && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center text-slate-400">
            Settings apply instantly to session
          </div>
        </div>
      )}
    </div>
  );
}
