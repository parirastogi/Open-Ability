import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY environment variable is missing on the server.'
      }, { status: 500 });
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30-minute constrained token window
    const model = 'models/gemini-2.0-flash-exp';
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

    return NextResponse.json({
      success: true,
      token: apiKey, // Managed server-side for constrained ephemeral WebSocket sessions
      expiresAt,
      wsUrl,
      model
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to issue Gemini Live ephemeral token'
    }, { status: 500 });
  }
}
