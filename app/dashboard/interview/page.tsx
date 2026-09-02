'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  AlertCircle, 
  Award, 
  CheckCircle, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  Bookmark,
  AwardIcon,
  Accessibility
} from 'lucide-react';

interface MockQuestion {
  text: string;
  category: 'Technical' | 'Behavioral' | 'Role-specific' | 'Communication';
  suggestedIdeal: string;
}

export default function InterviewPage() {
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);

  // States: 'setup' | 'active' | 'feedback' | 'summary'
  const [stage, setStage] = useState<'setup' | 'active' | 'feedback' | 'summary'>('setup');
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // Active Practice states
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsQuestion, setTtsQuestion] = useState(false);

  // Individual evaluation
  const [currentEvaluation, setCurrentEvaluation] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    ratings: { relevance: number; quality: number; clarity: number; structure: number; confidence: number };
  } | null>(null);

  // All session evaluations accumulated
  const [sessionEvals, setSessionEvals] = useState<{
    question: string;
    answer: string;
    score: number;
    strengths: string[];
    improvements: string[];
  }[]>([]);

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

  // Set default selected job on mount
  useEffect(() => {
    if (seedJobs.length > 0) {
      setSelectedJobId(seedJobs[0].id);
    }
  }, []);

  useEffect(() => {
    const handleVoiceControl = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.command === 'start') {
        startInterview();
      } else if (detail.command === 'next') {
        // If an answer is ready but not evaluated, evaluate first
        if (stage === 'active' && answerInput.trim()) {
          handleEvaluateAnswer();
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('voice-interview-control', handleVoiceControl);
    return () => {
      window.removeEventListener('voice-interview-control', handleVoiceControl);
    };
  }, [selectedJobId, currentIdx, answerInput, stage, questions]);

  const selectedJob = seedJobs.find(j => j.id === selectedJobId) || seedJobs[0];

  const startInterview = () => {
    // Generate 3 customized questions for the practice job
    const practiceQuestions: MockQuestion[] = [
      {
        text: `Explain how you would implement a keyboard-navigable and screen-reader accessible interactive menu/grid component in React for a target role of ${selectedJob?.title || 'Engineer'}.`,
        category: 'Technical',
        suggestedIdeal: 'Use semantic HTML tags, explicit tabIndex management, ARIA attributes, and key down handlers.'
      },
      {
        text: "Tell me about a time when you collaborated with a product designer to adjust screen layouts or schedules to satisfy access guidelines. How did you resolve differences?",
        category: 'Behavioral',
        suggestedIdeal: 'Focus on communication clarity, collaborative prototyping, and citing accessibility standards.'
      },
      {
        text: `As a candidate targetting ${selectedJob?.title || 'Role'}, how do you structure performance optimizations when loading complex data visuals or dashboards?`,
        category: 'Role-specific',
        suggestedIdeal: 'Highlight techniques like lazy loading, asset compression, and CSS containment.'
      }
    ];

    setQuestions(practiceQuestions);
    setCurrentIdx(0);
    setAnswerInput('');
    setSessionEvals([]);
    setCurrentEvaluation(null);
    setStage('active');

    if (ttsQuestion && practiceQuestions.length > 0) {
      speechService.speak(practiceQuestions[0].text);
    }
  };

  const handleEvaluateAnswer = () => {
    if (!answerInput.trim()) return;

    // Simulate structured evaluation based on answer criteria
    // Scoring criteria: relevance, quality, clarity, structure, confidence
    // We ignone voice stutter/tempo to prevent accessibility bias
    const scoreVal = 8.2;
    const evaluationObj = {
      score: scoreVal,
      strengths: [
        "Good technical explanation of semantic markup and ARIA widgets.",
        "Relevant example of managing keyboard focus states."
      ],
      improvements: [
        "Explain evaluation metrics and keyboard focus-traps more clearly."
      ],
      ratings: {
        relevance: 9,
        quality: 8,
        clarity: 8,
        structure: 8,
        confidence: 8
      }
    };

    setCurrentEvaluation(evaluationObj);
    
    // Accumulate evaluation
    setSessionEvals(prev => [
      ...prev,
      {
        question: questions[currentIdx].text,
        answer: answerInput,
        score: scoreVal * 10, // convert 8.2/10 to 82% scale
        strengths: evaluationObj.strengths,
        improvements: evaluationObj.improvements
      }
    ]);

    setStage('feedback');
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswerInput('');
      setCurrentEvaluation(null);
      setStage('active');
      
      if (ttsQuestion) {
        speechService.speak(questions[currentIdx + 1].text);
      }
    } else {
      // Completed last question, transition to Summary
      setStage('summary');
    }
  };

  const startVoiceCapture = () => {
    setIsListening(true);
    speechService.startListening(
      (result) => {
        setAnswerInput((prev) => (prev ? prev + ' ' + result : result));
        setIsListening(false);
      },
      (error) => {
        console.error(error);
        setIsListening(false);
      }
    );
  };

  const stopVoiceCapture = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const toggleVoiceCapture = () => {
    if (isListening) stopVoiceCapture();
    else startVoiceCapture();
  };

  const readQuestionAloud = () => {
    const q = questions[currentIdx];
    if (q) {
      speechService.speak(q.text);
    }
  };

  // Compile final summary stats
  const calculateAverageReadiness = () => {
    if (sessionEvals.length === 0) return 82;
    const total = sessionEvals.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / sessionEvals.length);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">AI Interview Support</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Prepare for targeted roles using structured practice loops with audio/transcription accessibility controls.
        </p>
      </div>

      {/* Stage 1: Setup */}
      {stage === 'setup' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-850 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> Start Preparation Practice
          </h3>

          <div className="space-y-4">
            {/* Job selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Select Practice Role Profile</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none dark:text-white text-slate-700"
              >
                {seedJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title} at {j.company}</option>
                ))}
              </select>
            </div>

            {/* Read Aloud toggler */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ttsQuestion}
                  onChange={(e) => setTtsQuestion(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-450 focus:outline-none"
                />
                <span>Read questions aloud automatically (Audio Assistance)</span>
              </label>
            </div>
          </div>

          {/* Active profile guidelines warning banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-450 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 text-slate-650 dark:text-slate-250 font-bold border-b border-slate-200 dark:border-slate-850 pb-1">
              <Accessibility className="w-4 h-4 text-emerald-500" /> Inclusive Grading Guidelines Enabled
            </div>
            <p>
              OpenAbility AI evaluations focus exclusively on your answer content depth and technical problem-solving. Speech velocity, pronunciation accents, and typing duration characteristics do not impact overall readiness grades.
            </p>
          </div>

          <button
            onClick={startInterview}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl text-xs transition focus:outline-none"
          >
            Launch Interview Session
          </button>
        </div>
      )}

      {/* Stage 2: Active simulation */}
      {stage === 'active' && questions.length > 0 && (
        <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Question {currentIdx + 1} of {questions.length} • {questions[currentIdx].category} Category
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{selectedJob?.title} Prep</span>
          </div>

          {/* Question Text */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-850 dark:text-white leading-relaxed">
              {questions[currentIdx].text}
            </h3>
            <button
              onClick={readQuestionAloud}
              className="p-2 border border-slate-250 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 rounded-xl hover:text-emerald-500 transition shrink-0 focus:outline-none"
              title="Play Question Audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Answer Input */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500">Your practice response answer</label>
              <button
                type="button"
                onClick={toggleVoiceCapture}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition focus:outline-none ${
                  isListening 
                    ? 'bg-red-50 border-red-200 text-red-500 animate-pulse font-extrabold' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-550 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Stop listening' : 'Answer with Mic Speech'}</span>
              </button>
            </div>

            <textarea
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="Type your practice response or toggle Speech Recognition to record via your mic..."
              rows={6}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white leading-relaxed"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={() => setStage('setup')}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Quit Prep
            </button>
            <button
              onClick={handleEvaluateAnswer}
              disabled={!answerInput.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-600 dark:text-slate-950 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
            >
              Evaluate Answer
            </button>
          </div>

        </div>
      )}

      {/* Stage 3: Single-Question Feedback Screen */}
      {stage === 'feedback' && currentEvaluation && (
        <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Evaluation Feedback: Question {currentIdx + 1}
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-white">
              Score: {currentEvaluation.score}/10
            </span>
          </div>

          {/* Ratings parameters checks */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {[
              { name: 'Relevance', val: currentEvaluation.ratings.relevance },
              { name: 'Tech Quality', val: currentEvaluation.ratings.quality },
              { name: 'Clarity', val: currentEvaluation.ratings.clarity },
              { name: 'Structure', val: currentEvaluation.ratings.structure },
              { name: 'Confidence', val: currentEvaluation.ratings.confidence }
            ].map((rating, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{rating.name}</span>
                <span className="text-xs font-bold text-slate-750 dark:text-slate-200 block mt-1">{rating.val}/10</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Strengths */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-650 dark:text-emerald-400 uppercase tracking-wider block">Strengths:</span>
              <div className="space-y-1.5 pl-1 text-xs">
                {currentEvaluation.strengths.map((str, idx) => (
                  <p key={idx} className="flex items-start gap-2 text-slate-650 dark:text-slate-350">
                    <span className="text-emerald-500">✓</span>
                    <span>{str}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Improve:</span>
              <div className="space-y-1.5 pl-1 text-xs">
                {currentEvaluation.improvements.map((imp, idx) => (
                  <p key={idx} className="flex items-start gap-2 text-slate-650 dark:text-slate-350">
                    <span className="text-amber-500 font-bold">→</span>
                    <span>{imp}</span>
                  </p>
                ))}
              </div>
            </div>

          </div>

          {/* Controls */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-600 dark:text-slate-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Session Summary'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Stage 4: Session Summary Dashboard */}
      {stage === 'summary' && (
        <div className="max-w-3xl space-y-6">
          
          {/* Circular score banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Session Finished
              </span>
              <h3 className="font-extrabold text-base sm:text-lg">Interview Readiness Analysis</h3>
              <p className="text-xs text-slate-400">Target Role Profile: {selectedJob?.title}</p>
            </div>
            
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center shrink-0">
              <span className="text-2xl font-black text-emerald-450">{calculateAverageReadiness()}%</span>
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider mt-1">Readiness Score</span>
            </div>
          </div>

          {/* Strengths / Improvements Summary grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Strengths */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-emerald-650 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 dark:border-slate-850 pb-2">
                <CheckCircle className="w-4 h-4" /> Top strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-350 list-none pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Solid technical awareness of WCAG 2.2 AA benchmarks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Logical and clear explanation structure when framing answers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Good use of direct project examples inside experience records.</span>
                </li>
              </ul>
            </div>

            {/* Top Improvements */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 dark:border-slate-850 pb-2">
                <TrendingUp className="w-4 h-4 animate-pulse" /> Top improvements
              </h4>
              <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-350 list-none pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">→</span>
                  <span>Explain grid evaluation metrics and keystrokes focus cycles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">→</span>
                  <span>Incorporate database indexing arguments when framing scaling grids.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Practice topics recommended list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Bookmark className="w-4 h-4 text-emerald-500" /> Recommended practice topics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Keyboard focus traps & grids', time: '1.5 hours' },
                { title: 'ARIA roles hierarchies specs', time: '2 hours' },
                { title: 'Semantic tag layout validation', time: '1 hour' }
              ].map((topic, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs">
                  <span className="font-bold text-slate-750 dark:text-slate-200 block">{topic.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Practice Target: {topic.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="flex justify-end gap-3">
            <Link
              href="/dashboard/jobs"
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Back to Jobs Board
            </Link>
            <button
              onClick={() => setStage('setup')}
              className="px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 dark:text-slate-950 text-white hover:bg-slate-850 rounded-xl text-xs font-bold transition focus:outline-none"
            >
              Restart Prep Session
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
