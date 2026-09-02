'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function GeminiLiveTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [micStatus, setMicStatus] = useState<'INACTIVE' | 'REQUESTING' | 'ACTIVE' | 'ERROR'>('INACTIVE');
  const [geminiStatus, setGeminiStatus] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING'>('IDLE');
  
  // Real-time PCM Diagnostic Counters
  const [chunksSent, setChunksSent] = useState<number>(0);
  const [totalBytesSent, setTotalBytesSent] = useState<number>(0);
  const [lastChunkSize, setLastChunkSize] = useState<number>(0);
  const [micLevel, setMicLevel] = useState<number>(0);

  // Transcriptions & Logs
  const [inputTranscription, setInputTranscription] = useState<string>('');
  const [outputStatus, setOutputStatus] = useState<string>('Ready');
  const [logs, setLogs] = useState<string[]>([]);
  const [pipelineState, setPipelineState] = useState<string>('INACTIVE');

  // Audio & WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackWorkletRef = useRef<AudioWorkletNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pendingPcmBufferRef = useRef<number[]>([]);
  const isStreamingRef = useRef<boolean>(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
    console.log(`[LIVE TEST] ${msg}`);
  };

  // Phase 0: Start Voice Session (Microphone + WebSocket)
  const startVoiceTest = async () => {
    if (isStreamingRef.current) return;
    addLog('MIC_REQUESTED: Requesting microphone permission...');
    setMicStatus('REQUESTING');
    setConnectionStatus('CONNECTING');
    setPipelineState('INITIALIZING');

    try {
      // 1. Request Microphone MediaStream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;
      addLog('MIC_GRANTED: Microphone access granted.');
      setMicStatus('ACTIVE');

      // 2. Fetch Ephemeral Token Configuration
      addLog('GEMINI_SOCKET_CONNECTING: Fetching short-lived session token...');
      const tokenRes = await fetch('/api/gemini/live-token', { method: 'POST' });
      const tokenData = await tokenRes.json();

      if (!tokenData.success || !tokenData.wsUrl) {
        addLog(`GEMINI_ERROR: Failed to fetch token - ${tokenData.error}`);
        setConnectionStatus('ERROR');
        return;
      }

      // 3. Connect WebSocket to Gemini Live
      const ws = new WebSocket(tokenData.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog('GEMINI_SOCKET_CONNECTED: WebSocket opened to Gemini Live endpoint.');
        setConnectionStatus('CONNECTED');
        setGeminiStatus('LISTENING');

        // Send Initial Setup with Google Official geminilive.js Format
        const setupPayload = {
          setup: {
            model: tokenData.model || 'models/gemini-2.0-flash-exp',
            generationConfig: {
              responseModalities: ['AUDIO', 'TEXT'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Puck'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [
                {
                  text: `You are a voice input test assistant. Listen carefully to the user's speech. The user will say simple words such as: Yes, No, English, Hindi, Yes please, Yeah, I want English. Wait for the user to finish speaking. Return a short spoken response acknowledging what you heard.`
                }
              ]
            },
            inputAudioTranscription: {}
          }
        };

        ws.send(JSON.stringify(setupPayload));
        addLog('GEMINI_SESSION_CONFIGURED: Initial setup payload sent to Gemini Live.');
        
        // 4. Initialize 16kHz PCM Capture AudioContext & AudioWorklet
        initAudioCapture(stream);
        
        // 5. Initialize 24kHz PCM Playback AudioContext & AudioWorklet
        initAudioPlayback();
      };

      ws.onmessage = (event) => {
        handleServerMessage(event.data);
      };

      ws.onerror = (err) => {
        addLog('GEMINI_ERROR: WebSocket error occurred.');
        setConnectionStatus('ERROR');
      };

      ws.onclose = () => {
        addLog('GEMINI_SOCKET_CLOSED: WebSocket session closed.');
        setConnectionStatus('DISCONNECTED');
        setGeminiStatus('IDLE');
      };
    } catch (err: any) {
      addLog(`GEMINI_ERROR: Failed to start test session - ${err.message}`);
      setMicStatus('ERROR');
      setConnectionStatus('ERROR');
    }
  };

  // Initialize 16kHz PCM Microphone Capture AudioWorklet
  const initAudioCapture = async (stream: MediaStream) => {
    try {
      addLog('AUDIO_CONTEXT_CREATED: Creating 16kHz AudioContext for microphone capture...');
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      addLog('AUDIO_WORKLET_LOADED: Loading /audio-worklet/capture.worklet.js...');
      await ctx.audioWorklet.addModule('/audio-worklet/capture.worklet.js');

      const worklet = new AudioWorkletNode(ctx, 'audio-capture-processor');
      workletNodeRef.current = worklet;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(worklet);

      isStreamingRef.current = true;
      addLog('PCM_CAPTURE_STARTED: Worklet capturing Int16 PCM samples (~100ms 16kHz chunks)...');
      setPipelineState('AUDIO IS REACHING WORKLET');

      let chunkCount = 0;
      let totalBytes = 0;

      worklet.port.onmessage = (event) => {
        if (!isStreamingRef.current) return;

        if (event.data.type === 'audio') {
          const inputData: Float32Array = event.data.data;
          
          // Calculate RMS level for UI meter
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          setMicLevel(Math.min(100, Math.round(rms * 400)));

          // Convert Float32 (-1.0 to 1.0) to Int16 PCM (-32768 to 32767)
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            const int16Sample = s < 0 ? s * 0x8000 : s * 0x7FFF;
            pendingPcmBufferRef.current.push(int16Sample);
          }

          // Aggregate into target ~100ms chunks (1600 samples = 3200 bytes)
          if (pendingPcmBufferRef.current.length >= 1600) {
            const chunkSamples = pendingPcmBufferRef.current.splice(0, 1600);
            const int16Array = new Int16Array(chunkSamples);
            const base64Audio = arrayBufferToBase64(int16Array.buffer);

            // Stream base64 PCM over WebSocket (Google Official Format: realtimeInput.audio)
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                realtimeInput: {
                  audio: {
                    mimeType: 'audio/pcm',
                    data: base64Audio
                  }
                }
              }));

              chunkCount += 1;
              totalBytes += int16Array.buffer.byteLength;
              setChunksSent(chunkCount);
              setTotalBytesSent(totalBytes);
              setLastChunkSize(int16Array.buffer.byteLength);
            }
          }
        }
      };
    } catch (err: any) {
      addLog(`AUDIO_CAPTURE_ERROR: ${err.message}`);
      setPipelineState('MICROPHONE AUDIO IS NOT REACHING AUDIOWORKLET');
    }
  };

  // Initialize 24kHz PCM Audio Playback AudioWorklet
  const initAudioPlayback = async () => {
    try {
      const pCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      playbackContextRef.current = pCtx;

      if (pCtx.state === 'suspended') {
        await pCtx.resume();
      }

      await pCtx.audioWorklet.addModule('/audio-worklet/playback.worklet.js');
      const pWorklet = new AudioWorkletNode(pCtx, 'pcm-processor');
      const gainNode = pCtx.createGain();
      gainNode.gain.value = 1.0;

      pWorklet.connect(gainNode);
      gainNode.connect(pCtx.destination);
      playbackWorkletRef.current = pWorklet;

      addLog('AUDIO_PLAYBACK_INITIALIZED: 24kHz Gemini audio playback worklet ready.');
    } catch (err: any) {
      addLog(`AUDIO_PLAYBACK_ERROR: ${err.message}`);
    }
  };

  // Play Gemini 24kHz PCM base64 audio output
  const playGeminiAudioChunk = (base64Audio: string) => {
    try {
      if (playbackContextRef.current && playbackContextRef.current.state === 'suspended') {
        playbackContextRef.current.resume();
      }

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const inputArray = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(inputArray.length);
      for (let i = 0; i < inputArray.length; i++) {
        float32Data[i] = inputArray[i] / 32768;
      }

      if (playbackWorkletRef.current) {
        playbackWorkletRef.current.port.postMessage(float32Data);
        setGeminiStatus('SPEAKING');
        setOutputStatus('Playing audio response...');
      }
    } catch (err: any) {
      addLog(`PLAYBACK_ERROR: ${err.message}`);
    }
  };

  // Handle incoming Gemini Live WebSocket Server Messages (Google geminilive.js Format)
  const handleServerMessage = (dataStr: string) => {
    try {
      const msg = JSON.parse(dataStr);

      // 1. Handle Input Audio Transcription Diagnostics
      if (msg.serverContent?.inputTranscription?.text || msg.serverContent?.interimTranscript) {
        const text = msg.serverContent?.inputTranscription?.text || msg.serverContent?.interimTranscript;
        if (text) {
          setInputTranscription(text);
          addLog(`GEMINI_INPUT_TRANSCRIPTION: "${text}"`);
          setPipelineState('GEMINI AUDIO PIPELINE VERIFIED');
        }
      }

      if (msg.serverContent?.userTurn?.parts) {
        for (const part of msg.serverContent.userTurn.parts) {
          if (part.text) {
            setInputTranscription(part.text);
            addLog(`GEMINI_INPUT_FINAL: "${part.text}"`);
            setPipelineState('GEMINI AUDIO PIPELINE VERIFIED');
          }
        }
      }

      // 2. Handle Gemini Audio Responses
      if (msg.serverContent?.modelTurn?.parts) {
        for (const part of msg.serverContent.modelTurn.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
            addLog('GEMINI_AUDIO_RECEIVED: Received 24kHz PCM audio chunk from Gemini.');
            playGeminiAudioChunk(part.inlineData.data);
          }
          if (part.text) {
            setOutputStatus(`Assistant text: "${part.text}"`);
          }
        }
      }

      // 3. Handle Turn Completion
      if (msg.serverContent?.turnComplete) {
        addLog('GEMINI_TURN_COMPLETE: Model turn complete.');
        setGeminiStatus('LISTENING');
        setOutputStatus('Turn complete. Listening for user...');
      }

      // 4. Handle Barge-in Interruption Signal
      if (msg.serverContent?.interrupted) {
        addLog('GEMINI_INTERRUPTED: User interrupted playback.');
        if (playbackWorkletRef.current) {
          playbackWorkletRef.current.port.postMessage('interrupt');
        }
        setGeminiStatus('LISTENING');
        setOutputStatus('Interrupted. Listening...');
      }
    } catch (err: any) {
      addLog(`MESSAGE_PARSE_ERROR: ${err.message}`);
    }
  };

  // Stop Voice Session
  const stopVoiceTest = () => {
    isStreamingRef.current = false;
    pendingPcmBufferRef.current = [];

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setMicStatus('INACTIVE');
    setConnectionStatus('DISCONNECTED');
    setGeminiStatus('IDLE');
    setMicLevel(0);
    addLog('TEST_STOPPED: Voice session completely stopped.');
  };

  useEffect(() => {
    return () => {
      stopVoiceTest();
    };
  }, []);

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '16px', marginTop: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 8px 0' }}>
          🎙 OpenAbility Phase 0 — Isolated Gemini Live Audio Test
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Direct PCM Microphone Stream &rarr; Gemini Live Real-Time Session &rarr; Live Input Transcription Diagnostics.
        </p>
      </header>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={startVoiceTest}
          disabled={connectionStatus === 'CONNECTED' || connectionStatus === 'CONNECTING'}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: connectionStatus === 'CONNECTED' ? '#334155' : '#0284c7',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: connectionStatus === 'CONNECTED' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {connectionStatus === 'CONNECTING' ? '⏳ Connecting to Gemini Live...' : '▶ Start Voice Test'}
        </button>

        <button
          onClick={stopVoiceTest}
          disabled={connectionStatus === 'DISCONNECTED'}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: connectionStatus === 'DISCONNECTED' ? '#334155' : '#ef4444',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: connectionStatus === 'DISCONNECTED' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ⏹ Stop Voice Test
        </button>
      </div>

      {/* Status Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>MICROPHONE STATUS</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: micStatus === 'ACTIVE' ? '#4ade80' : '#f87171' }}>
            {micStatus === 'ACTIVE' ? '🎙 ACTIVE' : micStatus}
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>GEMINI LIVE SESSION</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: connectionStatus === 'CONNECTED' ? '#38bdf8' : '#f87171' }}>
            {connectionStatus === 'CONNECTED' ? '⚡ CONNECTED' : connectionStatus}
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>MODEL STATE</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: geminiStatus === 'SPEAKING' ? '#c084fc' : '#4ade80' }}>
            {geminiStatus}
          </div>
        </div>
      </div>

      {/* Microphone Level & PCM Diagnostics */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>Microphone Level Meter</span>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>{micLevel}%</span>
        </div>
        <div style={{ width: '100%', height: '16px', backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ width: `${micLevel}%`, height: '100%', backgroundColor: micLevel > 70 ? '#ef4444' : '#38bdf8', transition: 'width 0.1s ease' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '13px', color: '#cbd5e1', paddingTop: '12px', borderTop: '1px solid #334155' }}>
          <div>Chunks Sent: <strong style={{ color: '#38bdf8' }}>{chunksSent}</strong></div>
          <div>Total Bytes: <strong style={{ color: '#38bdf8' }}>{totalBytesSent.toLocaleString()} B</strong></div>
          <div>Chunk Size: <strong style={{ color: '#38bdf8' }}>{lastChunkSize} B</strong></div>
          <div>Pipeline Status: <strong style={{ color: pipelineState.includes('VERIFIED') ? '#4ade80' : '#facc15' }}>{pipelineState}</strong></div>
        </div>
      </div>

      {/* Live Input Transcription Box */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #38bdf8', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px' }}>
          [GEMINI INPUT TRANSCRIPTION DIAGNOSTIC]
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: inputTranscription ? '#ffffff' : '#64748b', minHeight: '40px' }}>
          {inputTranscription || 'Speak "Yes", "No", "English", or "Hindi" into your microphone...'}
        </div>
      </div>

      {/* Output Status */}
      <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>GEMINI AUDIO OUTPUT STATUS</div>
        <div style={{ fontSize: '15px', color: '#cbd5e1' }}>{outputStatus}</div>
      </div>

      {/* Diagnostic Console Logs */}
      <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px' }}>DIAGNOSTIC LOG CONSOLE</div>
        <div style={{ maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#a7f3d0' }}>
          {logs.length === 0 ? <div style={{ color: '#475569' }}>Logs will appear here when testing...</div> : logs.map((log, index) => <div key={index}>{log}</div>)}
        </div>
      </div>
    </div>
  );
}
