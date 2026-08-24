import { NextRequest, NextResponse } from 'next/server';

const OPENWA_HOST = process.env.OPENWA_HOST || 'http://130.210.12.220:2785';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || '';
const DEFAULT_INGRESS_URL = process.env.OPENWA_SMS_HOOK_URL || (OPENWA_HOST ? `${OPENWA_HOST}/api/ingress/supabase-otp-hook/currentadda-otp/send-sms` : '');

// Fallback session IDs in case /api/sessions fetch is temporarily down or slow
const KNOWN_SESSIONS = [
  { id: '5b0da3ac-21e8-490f-80f3-12be9fafcebc', name: 'otp2' },
  { id: 'db88cc61-5f49-474e-a66b-4647ae87697a', name: 'otp' },
];

// In-memory OTP counter for session rotation
let globalOtpCounter = 0;

// Cache active sessions for 60 seconds
let cachedSessions: any[] = KNOWN_SESSIONS;
let lastSessionsFetch = 0;

async function getReadySessions(): Promise<any[]> {
  if (!OPENWA_HOST || !OPENWA_API_KEY) {
    return cachedSessions.length > 0 ? cachedSessions : KNOWN_SESSIONS;
  }
  const now = Date.now();
  if (now - lastSessionsFetch < 60000 && cachedSessions.length > 0) {
    return cachedSessions;
  }

  try {
    const res = await fetch(`${OPENWA_HOST}/api/sessions`, {
      headers: {
        'X-API-Key': OPENWA_API_KEY,
      },
      signal: AbortSignal.timeout(2500),
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
    console.warn('Failed to refresh OpenWA sessions list, using cache/fallback:', err);
  }

  return cachedSessions.length > 0 ? cachedSessions : KNOWN_SESSIONS;
}

/**
 * Dispatches the WhatsApp OTP message exactly once using available sessions
 */
async function dispatchWhatsAppOtp({
  chatId,
  messageText,
  rawBody,
  forwardHeaders,
}: {
  chatId: string;
  messageText: string;
  rawBody: string;
  forwardHeaders: Record<string, string>;
}): Promise<boolean> {
  const readySessions = await getReadySessions();

  if (readySessions.length > 0) {
    const primaryIndex = Math.floor(globalOtpCounter / 3) % readySessions.length;
    globalOtpCounter++;

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
          signal: AbortSignal.timeout(5000),
        });

        if (sendRes.ok || sendRes.status === 201) {
          console.log(`[send-sms] Successfully sent WhatsApp OTP to ${chatId} via session "${session.name}"`);
          return true; // Successfully sent once, terminate immediately!
        } else {
          console.warn(`[send-sms] Session ${session.name} returned status ${sendRes.status}`);
        }
      } catch (sendErr) {
        console.warn(`[send-sms] Failed to dispatch OTP on session ${session.name}:`, sendErr);
      }
    }
  }

  // Fallback to OpenWA ingress webhook ONLY if direct session dispatch failed
  if (DEFAULT_INGRESS_URL) {
    try {
      console.log(`[send-sms] Attempting fallback to ingress URL: ${DEFAULT_INGRESS_URL}`);
      const ingressRes = await fetch(DEFAULT_INGRESS_URL, {
        method: 'POST',
        headers: forwardHeaders,
        body: rawBody,
        signal: AbortSignal.timeout(5000),
      });
      if (ingressRes.ok) {
        console.log(`[send-sms] Successfully dispatched OTP via OpenWA ingress fallback.`);
        return true;
      }
    } catch (ingressErr) {
      console.error('[send-sms] Ingress fallback error:', ingressErr);
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
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

    if (!otp || !rawPhone) {
      console.warn('[send-sms] Missing otp or phone in payload:', payload);
      // Return 200 empty object to avoid breaking Supabase Auth Hook if a ping is sent
      return NextResponse.json({}, { status: 200 });
    }

    const cleanPhone = rawPhone.replace(/\D/g, '');
    const chatId = `${cleanPhone}@c.us`;
    const messageText = `📚 *CurrentAdda* | Your verification OTP is *${otp}*. Do not share it with anyone. Valid for 5 minutes.`;

    const forwardHeaders: Record<string, string> = {
      'Content-Type': req.headers.get('content-type') || 'application/json',
    };
    const webhookId = req.headers.get('webhook-id');
    const webhookTimestamp = req.headers.get('webhook-timestamp');
    const webhookSignature = req.headers.get('webhook-signature');
    if (webhookId) forwardHeaders['webhook-id'] = webhookId;
    if (webhookTimestamp) forwardHeaders['webhook-timestamp'] = webhookTimestamp;
    if (webhookSignature) forwardHeaders['webhook-signature'] = webhookSignature;

    // Start dispatch task
    const dispatchPromise = dispatchWhatsAppOtp({
      chatId,
      messageText,
      rawBody,
      forwardHeaders,
    });

    // Wait up to 1000ms for fast dispatch completion.
    // If it takes longer than 1000ms, respond immediately to Supabase (200 OK) so Supabase NEVER hits the 5.0s hook timeout!
    await Promise.race([
      dispatchPromise,
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`[send-sms] Responding 200 OK to Supabase in ${elapsed}ms for ${cleanPhone}`);

    // Supabase Send SMS Hook expects an empty object {} and HTTP 200 on success
    return NextResponse.json({}, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('[send-sms] Unexpected error in send-sms hook:', error);
    // Even in error cases, avoid breaking Supabase with a 500 if possible, or return empty object
    return NextResponse.json({}, { status: 200 });
  }
}
