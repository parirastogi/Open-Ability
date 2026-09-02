'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Play, 
  HelpCircle,
  FileText,
  Copy,
  Trash2,
  Check,
  MessageSquareText
} from 'lucide-react';

export default function VoiceAgentWidget() {
  const {
    status,
    transcript,
    voiceLogs,
    clearVoiceLogs,
    feedback,
    ttsEnabled,
    setTtsEnabled,
    startAgentListening,
    toggleAgentListening,
    triggerVoiceDemo,
    replayLastSpeech
  } = useVoiceAgent();

  const [expanded, setExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastToastText, setLastToastText] = useState('');

  // Auto-trigger live spoken text toast when transcript changes
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setLastToastText(transcript);
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [transcript]);

  // Custom event listener to open and trigger the voice agent from navigation
  useEffect(() => {
    const handleOpenAgent = () => {
      setExpanded(true);
      setTimeout(() => {
        startAgentListening();
      }, 100);
    };

    window.addEventListener('open-voice-agent', handleOpenAgent);
    return () => {
      window.removeEventListener('open-voice-agent', handleOpenAgent);
    };
  }, [startAgentListening]);

  // Focus and trigger listening when space/enter are typed
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleAgentListening();
    }
  };

  const copyLogsToClipboard = () => {
    if (voiceLogs.length === 0) return;
    const formatted = voiceLogs
      .map((log) => `[${log.timestamp}] ${log.source === 'user' ? 'User' : 'Assistant'}: ${log.text}`)
      .join('\n');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusText = () => {
    switch (status) {
      case 'LISTENING': return 'Listening to voice...';
      case 'PROCESSING': return 'Understanding...';
      case 'EXECUTING': return 'Executing command...';
      case 'CONFIRMING': return 'Waiting for confirmation...';
      case 'ERROR': return 'Connection Error';
      default: return 'Ask OpenAbility';
    }
  };

  return (
    <>
      {/* 🟢 LIVE SPOKEN TEXT OVERLAY TOAST BANNER (Appears at bottom-center of web page when speaking) */}
      {showToast && lastToastText && (
        <div 
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-[90%] bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <MessageSquareText className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Live Voice Log</span>
                <span className="text-[9px] text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <p className="text-xs font-semibold text-slate-100 truncate italic">
                &ldquo;{lastToastText}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setExpanded(true);
                setShowLogs(true);
                setShowToast(false);
              }}
              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
            >
              View Log
            </button>
            <button
              onClick={() => setShowToast(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
              aria-label="Close Toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING CONTROLLER WIDGET (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[99] font-sans">
        
        {/* Collapsed Bubble state */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2.5 px-4.5 py-3.5 bg-slate-900 border border-slate-800 text-white rounded-full hover:bg-slate-850 shadow-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-400 select-none animate-bounce"
            aria-label="Open Voice Agent Console"
            aria-live="polite"
          >
            <div className="relative">
              <Mic className="w-4 h-4 text-emerald-400" />
              {status === 'LISTENING' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            <span className="text-[11px] font-bold tracking-wider uppercase">Ask OpenAbility</span>
            {voiceLogs.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-500 text-slate-950 rounded-full">
                {voiceLogs.length}
              </span>
            )}
          </button>
        )}

        {/* Expanded Voice Agent Drawer */}
        {expanded && (
          <div 
            className="w-84 bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-250"
            role="dialog"
            aria-label="Voice Agent Interface"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="font-extrabold text-xs tracking-wider uppercase">Voice Agent Console</h3>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    showLogs ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Toggle Spoken Text Logs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Logs ({voiceLogs.length})</span>
                </button>

                <button
                  onClick={() => setExpanded(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition focus:outline-none"
                  aria-label="Collapse Voice Agent Console"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB 1: Voice Control & Microphone */}
            {!showLogs && (
              <>
                {/* Listening State Display */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col items-center justify-center text-center space-y-3.5 relative overflow-hidden">
                  <button
                    onClick={toggleAgentListening}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      status === 'LISTENING'
                        ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    aria-label={status === 'LISTENING' ? "Mute Microphone" : "Activate Microphone"}
                    aria-live="assertive"
                  >
                    <Mic className="w-6 h-6" />
                  </button>

                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      status === 'LISTENING' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {getStatusText()}
                    </span>
                    <p className="text-[10px] text-slate-450 leading-relaxed max-w-xs mt-1">
                      {feedback}
                    </p>
                  </div>

                  {/* Glowing sound wave bars during active listening */}
                  {status === 'LISTENING' && (
                    <div className="flex justify-center gap-0.5 pt-1.5 h-4">
                      <span className="w-0.5 bg-red-400 rounded-full animate-pulse h-2" style={{ animationDelay: '0ms' }} />
                      <span className="w-0.5 bg-red-400 rounded-full animate-pulse h-4" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 bg-red-400 rounded-full animate-pulse h-3" style={{ animationDelay: '300ms' }} />
                      <span className="w-0.5 bg-red-400 rounded-full animate-pulse h-1.5" style={{ animationDelay: '450ms' }} />
                    </div>
                  )}
                </div>

                {/* Latest Spoken Text Log Box */}
                {transcript && (
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30 text-[11px] space-y-1 leading-normal text-slate-200">
                    <div className="flex items-center justify-between text-emerald-400 font-extrabold text-[10px]">
                      <span>🗣️ SPOKEN TEXT HEARD:</span>
                      <span>JUST NOW</span>
                    </div>
                    <p className="italic font-medium text-white">&ldquo;{transcript}&rdquo;</p>
                  </div>
                )}

                {/* Controller buttons */}
                <div className="flex gap-2 justify-between">
                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`flex-1 py-2 px-3 border rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 focus:outline-none ${
                      ttsEnabled
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{ttsEnabled ? 'Voice: On' : 'Voice: Off'}</span>
                  </button>

                  <button
                    onClick={replayLastSpeech}
                    className="py-2 px-3 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 focus:outline-none"
                    title="Repeat last assistant readout response"
                  >
                    <Play className="w-3 h-3 fill-current" /> Repeat
                  </button>
                </div>

                {/* Try Voice Demo button */}
                <button
                  onClick={triggerVoiceDemo}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-[10px] transition focus:outline-none flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> Try Voice Demo
                </button>

                {/* Help Collapse triggers */}
                <div className="pt-2 border-t border-slate-850 text-center">
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto transition focus:outline-none"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHelp ? 'Hide available commands' : 'What can I say?'}</span>
                  </button>

                  {showHelp && (
                    <div className="mt-3 p-3 bg-slate-950 text-[10px] text-left text-slate-400 rounded-xl max-h-40 overflow-y-auto space-y-2 leading-relaxed">
                      <div>
                        <span className="font-bold text-slate-300 block">General Actions</span>
                        <p>• &ldquo;Click Get Started&rdquo;</p>
                        <p>• &ldquo;Go to my profile&rdquo;</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-300 block">Forms & Preferences</span>
                        <p>• &ldquo;My name is Vayu&rdquo;</p>
                        <p>• &ldquo;Select remote work&rdquo;</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-300 block">Jobs Board</span>
                        <p>• &ldquo;Find remote AI jobs&rdquo;</p>
                        <p>• &ldquo;Open the first job&rdquo;</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: SPOKEN TEXT LOG HISTORY PANEL */}
            {showLogs && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-300">📜 Spoken Voice Logs</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={copyLogsToClipboard}
                      disabled={voiceLogs.length === 0}
                      className="p-1.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 rounded-lg flex items-center gap-1 transition"
                      title="Copy logs to clipboard"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={clearVoiceLogs}
                      disabled={voiceLogs.length === 0}
                      className="p-1.5 text-[10px] font-bold bg-slate-800 hover:bg-red-950 hover:text-red-400 disabled:opacity-40 text-slate-400 rounded-lg transition"
                      title="Clear logs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
                  {voiceLogs.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic text-center py-6">
                      No spoken text logged yet. Speak into your mic to see text appear here!
                    </p>
                  ) : (
                    voiceLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-2 bg-slate-900 border border-slate-800/80 rounded-xl space-y-0.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="font-bold text-emerald-400">🗣️ User Voice</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-slate-200 font-medium whitespace-pre-wrap leading-snug">
                          &ldquo;{log.text}&rdquo;
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setShowLogs(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-[10px] transition"
                >
                  ← Back to Voice Control
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </>
  );
}

