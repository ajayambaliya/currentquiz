import { NextRequest, NextResponse } from 'next/server';

const OPENWA_HOST = process.env.OPENWA_HOST || 'http://130.210.12.220:2785';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'owa_k1_5cd511091c78b8a1ed5e7d7c53ca6f05aad6104e8d47b247395fa28cd666be83';
const DEFAULT_INGRESS_URL = process.env.OPENWA_SMS_HOOK_URL || `${OPENWA_HOST}/api/ingress/supabase-otp-hook/currentadda-otp/send-sms`;

// In-memory OTP counter for session load-balancing & rotation every 3 OTPs
let globalOtpCounter = 0;

// Cache active sessions for 30 seconds to avoid hitting OpenWA /api/sessions on every request
let cachedSessions: any[] = [];
let lastSessionsFetch = 0;

async function getReadySessions(): Promise<any[]> {
  const now = Date.now();
  if (cachedSessions.length > 0 && now - lastSessionsFetch < 30000) {
    return cachedSessions;
  }

  try {
    const res = await fetch(`${OPENWA_HOST}/api/sessions`, {
      headers: {
        'X-API-Key': OPENWA_API_KEY,
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const ready = Array.isArray(data) ? data.filter((s: any) => s.status === 'ready') : [];
      if (ready.length > 0) {
        cachedSessions = ready;
        lastSessionsFetch = now;
        return ready;
      }
    }
  } catch (err) {
    console.warn('Failed to refresh OpenWA sessions list:', err);
  }

  return cachedSessions;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any = null;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      // Non-JSON payload
    }

    // Extract OTP & Phone from Supabase Auth Hook payload
    const otp = payload?.sms?.otp || payload?.otp;
    const rawPhone = payload?.sms?.phone || payload?.user?.phone || payload?.phone;

    if (otp && rawPhone) {
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const chatId = `${cleanPhone}@c.us`;
      const messageText = `📚 *CurrentAdda* | Your verification OTP is *${otp}*. Do not share it with anyone. Valid for 5 minutes.`;

      const readySessions = await getReadySessions();

      if (readySessions.length > 0) {
        // Rotate every 3 OTPs: Math.floor(counter / 3) % readySessions.length
        const primaryIndex = Math.floor(globalOtpCounter / 3) % readySessions.length;
        globalOtpCounter++;

        // Try primary rotated session first, then failover to other ready sessions
        for (let i = 0; i < readySessions.length; i++) {
          const sessionIndex = (primaryIndex + i) % readySessions.length;
          const session = readySessions[sessionIndex];

          try {
            const sendRes = await fetch(`${OPENWA_HOST}/api/sessions/${session.id}/messages/send-text`, {
              method: 'POST',
              headers: {
                'X-API-Key': OPENWA_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chatId,
                text: messageText,
              }),
              signal: AbortSignal.timeout(6000),
            });

            if (sendRes.ok || sendRes.status === 201) {
              return NextResponse.json({ ok: true, session: session.name });
            }
          } catch (sendErr) {
            console.warn(`Failed to dispatch OTP on session ${session.name}, trying next session...`, sendErr);
          }
        }
      }
    }

    // Fallback to OpenWA ingress webhook forwarder if direct session dispatch failed
    const forwardHeaders: Record<string, string> = {
      'Content-Type': req.headers.get('content-type') || 'application/json',
    };

    const webhookId = req.headers.get('webhook-id');
    const webhookTimestamp = req.headers.get('webhook-timestamp');
    const webhookSignature = req.headers.get('webhook-signature');

    if (webhookId) forwardHeaders['webhook-id'] = webhookId;
    if (webhookTimestamp) forwardHeaders['webhook-timestamp'] = webhookTimestamp;
    if (webhookSignature) forwardHeaders['webhook-signature'] = webhookSignature;

    const response = await fetch(DEFAULT_INGRESS_URL, {
      method: 'POST',
      headers: forwardHeaders,
      body: rawBody,
      signal: AbortSignal.timeout(7000),
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error in send-sms route:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch WhatsApp OTP', details: error.message },
      { status: 500 }
    );
  }
}
