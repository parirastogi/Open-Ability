import { GEMINI_LIVE_TOOLS } from './geminiLiveTools';
import { pcmPlayer } from '../audio/pcmPlayer';

export interface GeminiToolCall {
  id: string;
  name: string;
  args: any;
}

export type ToolCallCallback = (toolCall: GeminiToolCall) => void;
export type TranscriptionDiagnosticCallback = (text: string, isFinal: boolean) => void;

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private onToolCallCallback: ToolCallCallback | null = null;
  private onTranscriptionCallback: TranscriptionDiagnosticCallback | null = null;

  public async connect(
    onToolCall: ToolCallCallback,
    onTranscription?: TranscriptionDiagnosticCallback
  ): Promise<boolean> {
    this.onToolCallCallback = onToolCall;
    this.onTranscriptionCallback = onTranscription || null;

    try {
      const tokenRes = await fetch('/api/gemini/live-token', { method: 'POST' });
      const tokenData = await tokenRes.json();

      if (!tokenData.success || !tokenData.wsUrl) {
        console.warn('Gemini Live token endpoint notice:', tokenData.error);
        return false;
      }

      return new Promise((resolve) => {
        this.ws = new WebSocket(tokenData.wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.sendInitialSetup(tokenData.model || 'models/gemini-2.0-flash-exp');
          console.log('[GEMINI] SESSION_CONNECTED to Gemini Live API WebSocket');
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleServerMessage(event.data);
        };

        this.ws.onerror = (err) => {
          console.error('[GEMINI] SESSION_ERROR WebSocket error:', err);
          this.isConnected = false;
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('[GEMINI] SESSION_CLOSED WebSocket closed');
          this.isConnected = false;
        };
      });
    } catch (err) {
      console.error('Failed to establish Gemini Live session:', err);
      return false;
    }
  }

  private sendInitialSetup(model: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Payload formatted to match Google official geminilive.js setup schema
    const setupPayload = {
      setup: {
        model,
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
        inputAudioTranscription: {},
        tools: GEMINI_LIVE_TOOLS
      }
    };

    this.ws.send(JSON.stringify(setupPayload));
  }

  public sendAudioChunk(base64Pcm: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isConnected) return;

    // Payload formatted to match Google official geminilive.js realtimeInput schema
    const audioPayload = {
      realtimeInput: {
        audio: {
          mimeType: 'audio/pcm',
          data: base64Pcm
        }
      }
    };

    this.ws.send(JSON.stringify(audioPayload));
  }

  public sendToolResponse(callId: string, functionName: string, output: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const responsePayload = {
      toolResponse: {
        functionResponses: [
          {
            response: { output },
            id: callId
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(responsePayload));
  }

  private handleServerMessage(dataStr: string): void {
    try {
      const msg = JSON.parse(dataStr);

      // Handle Input Audio Transcription Diagnostics
      if (msg.serverContent?.inputTranscription?.text || msg.serverContent?.interimTranscript) {
        const text = msg.serverContent?.inputTranscription?.text || msg.serverContent?.interimTranscript;
        if (text) {
          console.log(`[GEMINI INPUT INTERIM]: "${text}"`);
          if (this.onTranscriptionCallback) {
            this.onTranscriptionCallback(text, false);
          }
        }
      }

      if (msg.serverContent?.userTurn?.parts) {
        for (const part of msg.serverContent.userTurn.parts) {
          if (part.text) {
            console.log(`[GEMINI INPUT FINAL]: "${part.text}"`);
            if (this.onTranscriptionCallback) {
              this.onTranscriptionCallback(part.text, true);
            }
          }
        }
      }

      // Handle Gemini Live Audio Output
      if (msg.serverContent?.modelTurn?.parts) {
        for (const part of msg.serverContent.modelTurn.parts) {
          if (part.functionCall && this.onToolCallCallback) {
            this.onToolCallCallback({
              id: part.functionCall.id || 'call_' + Date.now(),
              name: part.functionCall.name,
              args: part.functionCall.args || {}
            });
          }
          if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
            pcmPlayer.play(part.inlineData.data);
          }
        }
      }

      // Handle Direct Tool Calls
      if (msg.toolCall) {
        const functionCalls = msg.toolCall.functionCalls || [];
        for (const fc of functionCalls) {
          if (this.onToolCallCallback) {
            this.onToolCallCallback({
              id: fc.id || 'call_' + Date.now(),
              name: fc.name,
              args: fc.args || {}
            });
          }
        }
      }

      // Handle Interruption Signal from Server
      if (msg.serverContent?.interrupted) {
        pcmPlayer.interrupt();
      }
    } catch (err) {
      console.error('Error handling Gemini Live server message:', err);
    }
  }

  public disconnect(): void {
    this.isConnected = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public active(): boolean {
    return this.isConnected;
  }
}

export const geminiLiveClient = new GeminiLiveClient();
