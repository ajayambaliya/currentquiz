import { NextRequest, NextResponse } from 'next/server';

const OPENWA_TARGET_URL = 'http://130.210.12.220:2785/api/ingress/supabase-otp-hook/currentadda-otp/send-sms';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Forward all incoming webhook headers to preserve standard webhook signatures
    const forwardHeaders: Record<string, string> = {
      'Content-Type': req.headers.get('content-type') || 'application/json',
    };

    const webhookId = req.headers.get('webhook-id');
    const webhookTimestamp = req.headers.get('webhook-timestamp');
    const webhookSignature = req.headers.get('webhook-signature');

    if (webhookId) forwardHeaders['webhook-id'] = webhookId;
    if (webhookTimestamp) forwardHeaders['webhook-timestamp'] = webhookTimestamp;
    if (webhookSignature) forwardHeaders['webhook-signature'] = webhookSignature;

    const response = await fetch(OPENWA_TARGET_URL, {
      method: 'POST',
      headers: forwardHeaders,
      body: rawBody,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error forwarding Supabase SMS hook to OpenWA:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch WhatsApp OTP', details: error.message },
      { status: 500 }
    );
  }
}
