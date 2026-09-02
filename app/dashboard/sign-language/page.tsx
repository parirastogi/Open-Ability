'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { demoCandidate } from '@/database/seed-data';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  AlertTriangle, 
  Volume2, 
  Info,
  CheckCircle,
  HelpCircle,
  Cpu,
  ArrowRight
} from 'lucide-react';

export default function SignLanguagePrototype() {
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('NONE');
  const [convertedText, setConvertedText] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

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

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      startSimulationTracking();
    } catch (err) {
      alert('Camera access denied or unavailable. Running prototype with video placeholder.');
      setCameraActive(true);
      startSimulationTracking(); // Fallback simulation loops
    }
  };

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDetectedGesture('NONE');
  };

  // Simulate skeleton tracking dots on a Canvas for high visual fidelity
  const startSimulationTracking = () => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (cameraActive) {
          // Draw random floating skeleton landmarks around the center representing hand bones
          ctx.strokeStyle = '#10b981'; // emerald-500
          ctx.fillStyle = '#10b981';
          ctx.lineWidth = 2.5;

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const t = Date.now() * 0.003;

          // Draw hand bounding area
          ctx.strokeRect(centerX - 100, centerY - 100, 200, 200);

          // Simulated hand nodes
          const joints = [
            { x: centerX + Math.sin(t) * 15, y: centerY + Math.cos(t) * 15 }, // Wrist
            { x: centerX - 30 + Math.sin(t * 1.2) * 5, y: centerY - 20 },
            { x: centerX - 10 + Math.sin(t * 1.4) * 8, y: centerY - 45 },
            { x: centerX + 10 + Math.sin(t * 1.5) * 6, y: centerY - 50 },
            { x: centerX + 35 + Math.sin(t * 1.1) * 7, y: centerY - 25 },
            // Finger Tips
            { x: centerX - 55 + Math.sin(t * 1.8) * 10, y: centerY - 70 },
            { x: centerX - 25 + Math.sin(t * 1.9) * 12, y: centerY - 95 },
            { x: centerX + 5 + Math.sin(t * 2.1) * 11, y: centerY - 100 },
            { x: centerX + 35 + Math.sin(t * 1.7) * 9, y: centerY - 80 }
          ];

          // Draw circles
          joints.forEach(j => {
            ctx.beginPath();
            ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw links
          ctx.beginPath();
          ctx.moveTo(joints[0].x, joints[0].y);
          ctx.lineTo(joints[1].x, joints[1].y);
          ctx.lineTo(joints[5].x, joints[5].y);

          ctx.moveTo(joints[0].x, joints[0].y);
          ctx.lineTo(joints[2].x, joints[2].y);
          ctx.lineTo(joints[6].x, joints[6].y);

          ctx.moveTo(joints[0].x, joints[0].y);
          ctx.lineTo(joints[3].x, joints[3].y);
          ctx.lineTo(joints[7].x, joints[7].y);

          ctx.moveTo(joints[0].x, joints[0].y);
          ctx.lineTo(joints[4].x, joints[4].y);
          ctx.lineTo(joints[8].x, joints[8].y);
          ctx.stroke();
        }
      }
      requestRef.current = requestAnimationFrame(render);
    };
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (cameraActive) {
      startSimulationTracking();
    }
  }, [cameraActive]);

  // Emulate Gesture selection & trigger VoiceAgentContext actions
  const simulateGesture = (gesture: string) => {
    setDetectedGesture(gesture);
    let phrase = '';
    
    switch (gesture) {
      case 'HELLO': phrase = "Hello there!"; break;
      case 'HELP': phrase = "I need job matching help."; break;
      case 'YES': phrase = "Yes, please."; break;
      case 'NO': phrase = "No, thank you."; break;
      case 'JOB': phrase = "What jobs should I apply for?"; break;
      case 'RESUME': phrase = "Analyze my resume."; break;
      case 'INTERVIEW': phrase = "Prepare me for mock interview."; break;
      default: phrase = "";
    }

    setConvertedText(phrase);
    if (phrase) {
      queryAssistant(phrase);
    }
  };

  const queryAssistant = async (queryText: string) => {
    setLoading(true);
    setAiResponse('');
    try {
      const response = await aiService.chatWithAssistant(
        queryText,
        {
          fullName: candidate.profile.fullName,
          skills: candidate.skills,
          accessibility: candidate.accessibility
        },
        []
      );
      setAiResponse(response);
      
      // Auto speak aloud if speech synthesis matches
      speechService.speak(response);
    } catch (e) {
      setAiResponse("Error querying assistant context.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setConvertedText(manualInput);
    queryAssistant(manualInput);
    setManualInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">Sign Language Portal</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Prototype demonstrating video-based hand gesture recognition integrated with the career assistant.
        </p>
      </div>

      {/* Prototype Indicator Warning */}
      <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-bold">Prototype Mode Fallback Active</span>
        </div>
        <p className="pl-6 text-[10px] text-slate-500 leading-normal">
          This portal simulates computer vision classification maps. It demonstrates the structural workflow pipeline (Gesture → Text → AI Assistant response) before deploying production TensorFlow model matrices.
        </p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Camera Feed Console (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-slate-850 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-500" /> Vision Classifier Feed
            </h3>
            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 focus:outline-none ${
                cameraActive 
                  ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100/50' 
                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/20'
              }`}
            >
              {cameraActive ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" /> Stop Feed
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" /> Start Camera
                </>
              )}
            </button>
          </div>

          {/* Video / Canvas viewport */}
          <div className="relative w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="absolute w-full h-full object-cover scale-x-[-1]"
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute w-full h-full top-0 left-0 pointer-events-none scale-x-[-1]"
                />
              </>
            ) : (
              <div className="text-center p-6 space-y-2">
                <CameraOff className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400">Camera feed disabled</p>
                <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                  Start camera feed to project fingers landmarks tracking box overlays.
                </p>
              </div>
            )}
          </div>

          {/* Quick ASL Vocabulary selector emulators */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">ASL Vocabulary Emulator:</span>
            <div className="flex flex-wrap gap-2">
              {['HELLO', 'HELP', 'YES', 'NO', 'JOB', 'RESUME', 'INTERVIEW'].map((word) => (
                <button
                  key={word}
                  onClick={() => simulateGesture(word)}
                  className={`px-3 py-1.5 border text-[10px] font-bold rounded-xl transition focus:outline-none ${
                    detectedGesture === word 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 italic mt-1 leading-normal">
              Click vocabulary buttons above to mimic gesture recognition events feeding the compiler pipeline.
            </p>
          </div>
        </div>

        {/* Right Column: AI Assistant Pipeline Results (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm min-h-[480px] flex flex-col justify-between">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Pipeline Diagnostics
            </h3>

            {/* Viewport logs */}
            <div className="flex-1 py-3 space-y-4 overflow-y-auto">
              
              {/* Detected Gesture */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 text-center">
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Detected Sign</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white uppercase mt-1 block">{detectedGesture}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-855 text-center">
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Converted Text</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white truncate mt-1 block">
                    {convertedText ? `"${convertedText}"` : 'AWAITING'}
                  </span>
                </div>
              </div>

              {/* AI assistant response */}
              {loading ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-400 animate-pulse text-center">
                  Querying Career Companion contexts...
                </div>
              ) : aiResponse ? (
                <div className="space-y-1 text-xs pt-3 border-t border-slate-100 dark:border-slate-850 animate-in fade-in duration-200">
                  <span className="font-bold text-slate-400 block">AI Assistant Response:</span>
                  <p className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-slate-705 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {aiResponse}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Select a preset ASL word or use the fallback manual trigger below to verify translation pipelines.
                </div>
              )}
            </div>

            {/* Accessibility manual textbox fallback */}
            <form onSubmit={handleManualSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Alternative query text fallback..."
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-white"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || loading}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
              >
                Send
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
