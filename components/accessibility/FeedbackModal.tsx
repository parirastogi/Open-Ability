'use client';

import React, { useState } from 'react';
import { Star, Send, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { AccessibilityFeedback } from '@/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  companyName?: string;
}

export default function FeedbackModal({ isOpen, onClose, jobTitle = 'Accessible UI Engineer', companyName = 'AccessiCorp' }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<'APPLICATION' | 'INTERVIEW' | 'WORKPLACE'>('INTERVIEW');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback: AccessibilityFeedback = {
      id: `fb-${Date.now()}`,
      jobId: 'job-0',
      candidateProfileId: 'cand-demo',
      type: feedbackType,
      rating,
      feedbackText: feedbackText || 'Great accessibility support during interview.',
      submittedAt: new Date().toISOString()
    };

    // Store in localStorage
    const existing = localStorage.getItem('openability_feedback_list');
    const list = existing ? JSON.parse(existing) : [];
    list.push(feedback);
    localStorage.setItem('openability_feedback_list', JSON.stringify(list));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" /> Accessibility Feedback Loop
          </h3>
          <p className="text-xs text-slate-500">
            Submit anonymous accessibility feedback for {companyName} ({jobTitle}). Over time, candidate ratings refine employer readiness scores.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-850 dark:text-white">Feedback Submitted!</h4>
            <p className="text-xs text-slate-500">Thank you for helping us make hiring processes accessible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Feedback Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'APPLICATION', label: 'Application' },
                  { key: 'INTERVIEW', label: 'Interview' },
                  { key: 'WORKPLACE', label: 'Workplace' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFeedbackType(item.key as any)}
                    className={`py-2 border rounded-xl font-bold transition ${
                      feedbackType === item.key
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Accessibility Rating
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Feedback Details & Specific Barrier Observations
              </label>
              <textarea
                rows={3}
                required
                placeholder="Were accommodations provided smoothly? Mention screen reader compatibility, captions, or entrance accessibility..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Accessibility Rating
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
