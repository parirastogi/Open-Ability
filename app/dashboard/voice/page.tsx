'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { jobsService } from '@/services/jobs';
import { demoCandidate } from '@/database/seed-data';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Accessibility
} from 'lucide-react';

type MicStatus = 'Ready' | 'Listening' | 'Processing' | 'Speaking';

export default function VoicePage() {
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [status, setStatus] = useState<MicStatus>('Ready');
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [manualInput, setManualInput] = useState('');

  const micButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check speech capabilities
    setSpeechSupported(speechService.isSpeechSupported());

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

    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  const handleStartListening = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported by your browser. Please type your query in the fallback box below.');
      return;
    }

    speechService.stopSpeaking();
    setStatus('Listening');
    setUserTranscript('');
    
    speechService.startListening(
      (result) => {
        setStatus('Processing');
        setUserTranscript(result);
        processVoiceRequest(result);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setStatus('Ready');
      }
    );
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setStatus('Ready');
  };

  const processVoiceRequest = async (text: string) => {
    setStatus('Processing');
    try {
      const response = await aiService.chatWithAssistant(
        text,
        {
          fullName: candidate.profile.fullName,
          skills: candidate.skills,
          accessibility: candidate.accessibility
        },
        []
      );
      
      setAiResponse(response);
      setStatus('Speaking');
      
      // Speak response aloud
      speechService.speak(response, () => {
        setStatus('Ready');
      });
    } catch (e) {
      setAiResponse("I encountered an error processing your speech request. Please try again.");
      setStatus('Ready');
    }
  };

  const handleReplay = () => {
    if (!aiResponse) return;
    setStatus('Speaking');
    speechService.speak(aiResponse, () => {
      setStatus('Ready');
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setUserTranscript(manualInput);
    setManualInput('');
    processVoiceRequest(manualInput);
  };

  // Keyboard accessibility helper for Space/Enter on microphone
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (status === 'Listening') {
        handleStopListening();
      } else {
        handleStartListening();
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">Multimodal Voice Portal</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          A voice-first workspace. Speak questions about remote jobs, skill gaps, or interview guidelines.
        </p>
      </div>

      {/* Speech warnings fallback */}
      {!speechSupported && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Speech Recognition is not fully supported in this browser. Running in manual keyboard text fallback mode.</span>
        </div>
      )}

      {/* Main Grid Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Voice Console Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 flex flex-col items-center justify-center min-h-[480px] shadow-sm">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-full border border-slate-800 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'Listening' 
                ? 'bg-red-500 animate-ping' 
                : status === 'Processing' 
                  ? 'bg-cyan-500 animate-pulse' 
                  : status === 'Speaking' 
                    ? 'bg-emerald-400 animate-bounce' 
                    : 'bg-emerald-600'
            }`} />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status: </span>
            <span className="font-extrabold text-slate-200">{status}</span>
          </div>

          {/* Central Microphone button (Keyboard Accessible) */}
          <button
            ref={micButtonRef}
            onClick={status === 'Listening' ? handleStopListening : handleStartListening}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition duration-200 outline-none border focus:ring-4 focus:ring-emerald-400/40 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
              status === 'Listening'
                ? 'bg-red-50 border-red-200 text-red-500 scale-105 shadow-xl shadow-red-500/10'
                : status === 'Speaking'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 scale-105 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
            aria-label={status === 'Listening' ? "Stop recording speech" : "Start recording speech"}
            aria-live="polite"
          >
            {status === 'Listening' ? (
              <MicOff className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
            <span className="text-[9px] uppercase font-bold tracking-widest">
              {status === 'Listening' ? 'Stop' : 'Speak'}
            </span>
          </button>

          {/* Control Bar Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleStartListening}
              disabled={status === 'Listening' || !speechSupported}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 disabled:opacity-30 rounded-xl text-xs font-bold transition focus:outline-none"
            >
              Start Listening
            </button>
            <button
              onClick={handleStopListening}
              disabled={status !== 'Listening'}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-300 disabled:opacity-30 rounded-xl text-xs font-bold transition focus:outline-none"
            >
              Stop Listening
            </button>
            <button
              onClick={handleReplay}
              disabled={!aiResponse || status === 'Listening'}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 disabled:opacity-30 text-slate-950 rounded-xl text-xs font-bold transition focus:outline-none flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Replay Response
            </button>
          </div>

          {/* Fallback Manual Text Input Form */}
          <form onSubmit={handleManualSubmit} className="w-full max-w-md pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Keyboard fallback query typing..."
              className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-white"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || status === 'Listening'}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition disabled:opacity-30"
            >
              Ask
            </button>
          </form>

        </div>

        {/* Right Side: Transcript Logging Display (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 min-h-[480px] flex flex-col justify-between shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Transcripts Log
            </h3>

            {/* Content viewport */}
            <div className="flex-1 py-4 space-y-4 overflow-y-auto">
              {userTranscript ? (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-400 block">You said:</span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 italic text-slate-850 dark:text-white leading-relaxed">
                    "{userTranscript}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  Speak a query to display your voice transcription output here.
                </div>
              )}

              {aiResponse && (
                <div className="space-y-1 text-xs pt-3 border-t border-slate-50 dark:border-slate-850">
                  <span className="font-bold text-slate-400 block">Assistant replied:</span>
                  <p className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {aiResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Quick suggested voice triggers checklist */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-850 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Suggested Voice Queries:</span>
              <div className="space-y-1.5">
                {[
                  "Find me remote AI engineering jobs.",
                  "What skills am I missing?",
                  "Prepare me for mock interview."
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserTranscript(q);
                      processVoiceRequest(q);
                    }}
                    disabled={status === 'Listening'}
                    className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-500/50 dark:border-slate-850 dark:hover:border-slate-750 bg-slate-50 hover:bg-emerald-50/10 text-left text-[10px] font-semibold text-slate-650 dark:text-slate-350 transition flex items-center justify-between"
                  >
                    <span>"{q}"</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
