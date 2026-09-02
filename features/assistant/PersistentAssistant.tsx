'use client';

import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function PersistentAssistant() {
  const { candidate } = useVoiceAgent();
  const fullName = candidate.profile?.fullName || 'Candidate';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hello! I'm your OpenAbility Career Companion. Ask me to check jobs, evaluate skills, or launch a mock interview session.` }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean speech synthesis if closing assistant
  useEffect(() => {
    if (!isOpen) {
      speechService.stopSpeaking();
    }
  }, [isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    const newMessages = [...messages, { role: 'user', content: textToSend } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.chatWithAssistant(
        textToSend,
        {
          fullName: candidate.profile?.fullName || 'Candidate',
          skills: candidate.skills,
          accessibility: candidate.accessibility
        },
        messages
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

      if (ttsEnabled) {
        speechService.speak(response);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm having a connection error. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    speechService.startListening(
      (result) => {
        setInput(result);
        setIsListening(false);
        // Automatically send the result
        handleSend(result);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 border border-slate-800 text-teal-400 hover:text-teal-300 hover:bg-slate-850 hover:scale-105 active:scale-95 shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 cursor-pointer"
          aria-label="Ask OpenAbility AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
          <span className="text-xs font-extrabold text-white tracking-wide">Ask OpenAbility</span>
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div className="w-96 h-[500px] flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm">Career Companion</h3>
                <span className="text-[10px] text-emerald-400 font-medium">{fullName} (Candidate Context)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-1.5 rounded-lg transition hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                  ttsEnabled ? 'text-emerald-400' : 'text-slate-400'
                }`}
                title={ttsEnabled ? "Mute responses" : "Read responses aloud"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition focus:outline-none focus:ring-1 focus:ring-emerald-400"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Box */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-900/10">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
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
            
            <div ref={chatEndRef} />
          </div>

          {/* Preset Helper Prompts */}
          <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
            <button
              onClick={() => handleSend("What jobs should I apply for?")}
              className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-full hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              💼 Recommended Jobs
            </button>
            <button
              onClick={() => handleSend("What skills am I missing?")}
              className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-full hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              🎓 Skills Gaps
            </button>
            <button
              onClick={() => handleSend("Prepare me for an AI Engineer Interview")}
              className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-full hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              🎤 Mock Interview
            </button>
          </div>

          {/* Message Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full transition flex items-center justify-center shrink-0 border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                isListening 
                  ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
              }`}
              title={isListening ? "Stop voice listening" : "Start voice listening"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your career..."
              className="flex-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-full bg-slate-900 dark:bg-emerald-600 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center shrink-0 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
