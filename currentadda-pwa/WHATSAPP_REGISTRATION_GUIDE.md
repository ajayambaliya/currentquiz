# CurrentAdda PWA - WhatsApp OTP Registration & Verification Guide

This document contains the complete technical specifications, database schema, API integration hooks, and frontend code snippets to add **WhatsApp Number Verification during User Registration** to `currentadda-pwa` using **Supabase Auth + OpenWA Gateway (`supabase-otp-hook`)**.

---

## 🔑 1. Architecture & Execution Flow

```
+------------------+         +------------------+         +-----------------------+         +------------------+
| User (FrontEnd)  | ------> |  Supabase Auth   | ------> | OpenWA Gateway Host   | ------> |  User WhatsApp   |
| (Enters Details) |         | (Generates OTP)  |         | (Verifies & Dispatches)|         | (Receives Code)  |
+------------------+         +------------------+         +-----------------------+         +------------------+
```

1. **User Input**: User fills Name, Email, and WhatsApp Phone Number (+91 XXXXXXXXXX).
2. **OTP Request**: Frontend calls `supabase.auth.signInWithOtp({ phone })`.
3. **Webhook Trigger**: Supabase signs an HTTP request with Standard Webhooks (`v1,whsec_...`) and calls OpenWA's ingress endpoint.
4. **Validation & Delivery**: OpenWA verifies signature (401 on bad signature), checks session health (503 on dead session), fast-acks Supabase (200 OK), and dispatches OTP text over WhatsApp to user's chat (`91XXXXXXXXXX@c.us`).
5. **OTP Verification**: User enters 6-digit code on frontend; Supabase verifies OTP and issues Auth Session JWT.
6. **Profile Saving**: User profile (Name, Email, Verified WhatsApp number) is upserted into Supabase `profiles` table.

---

## ⚡ 2. Infrastructure Setup & Wiring

### Step 1: Mint OpenWA Ingress Instance
Run this cURL command to create the ingress endpoint bound to your production WhatsApp session (`db88cc61-5f49-474e-a66b-4647ae87697a`):

```bash
curl -X POST "http://130.210.12.220:2785/api/integration/plugins/supabase-otp-hook/instances" \
  -H "X-API-Key: owa_k1_5cd511091c78b8a1ed5e7d7c53ca6f05aad6104e8d47b247395fa28cd666be83" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "currentadda-otp",
    "sessionScope": "db88cc61-5f49-474e-a66b-4647ae87697a",
    "config": {
      "appName": "CurrentAdda",
      "messageTemplate": "📚 *CurrentAdda* | Your verification OTP is *{otp}*. Do not share it with anyone. Valid for 5 minutes."
    }
  }'
```

> **Ingress Endpoint Generated**:  
> `http://130.210.12.220:2785/api/ingress/supabase-otp-hook/currentadda-otp/send-sms`

### Step 2: Supabase Auth Hook Configuration
1. Navigate to **Supabase Dashboard** ➔ **Authentication** ➔ **Auth Hooks**.
2. Click **Add hook** ➔ Select **Send SMS hook** ➔ Choose **HTTPS**.
3. Paste the Ingress URL above into the Endpoint URL field.
4. Click **Generate secret**. Copy the full secret string (`v1,whsec_...`).
5. Click **Save**.

### Step 3: Register Instance Secret in OpenWA
Pass the secret back to OpenWA so it can verify incoming webhook signatures host-side:

```bash
curl -X PATCH "http://130.210.12.220:2785/api/integration/plugins/supabase-otp-hook/instances/currentadda-otp" \
  -H "X-API-Key: owa_k1_5cd511091c78b8a1ed5e7d7c53ca6f05aad6104e8d47b247395fa28cd666be83" \
  -H "Content-Type: application/json" \
  -d '{"secret":"v1,whsec_YOUR_COPIED_SUPABASE_SECRET_HERE"}'
```

### Step 4: Enable Phone Provider in Supabase
1. Go to **Supabase Dashboard** ➔ **Authentication** ➔ **Providers** ➔ **Phone**.
2. Toggle **Enable Phone Provider**.
3. Select **SMS Provider** ➔ **Hook**.

---

## 🗄️ 3. Database Schema Setup (Supabase SQL)

Run the following SQL query in your **Supabase SQL Editor** to manage verified user profiles:

```sql
-- Create Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  whatsapp_number TEXT UNIQUE NOT NULL,
  is_whatsapp_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for high performance lookup
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

---

## 💻 4. Code Implementation (`currentadda-pwa`)

### A. Phone Sanitizer Utility (`lib/phone-helper.ts`)

```typescript
/**
 * Normalizes Indian 10-digit phone numbers to E.164 format (+91XXXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = `91${cleaned.slice(1)}`;
  }
  
  return `+${cleaned}`;
}
```

---

### B. Auth Service (`services/authService.ts`)

```typescript
import { supabase } from '@/lib/supabaseClient';
import { formatPhoneNumber } from '@/lib/phone-helper';

/**
 * 1. Sends WhatsApp OTP for registration
 */
export async function sendWhatsAppRegistrationOtp(rawPhone: string) {
  const formattedPhone = formatPhoneNumber(rawPhone);
  
  if (formattedPhone.length < 12) {
    throw new Error('Please enter a valid 10-digit WhatsApp mobile number.');
  }

  // Check if number already registered in profiles table
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_number', formattedPhone)
    .maybeSingle();

  if (existingUser) {
    throw new Error('This WhatsApp number is already registered. Please log in.');
  }

  // Trigger Supabase Phone OTP (Delivered via OpenWA WhatsApp Hook)
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to send WhatsApp OTP.');
  }

  return { success: true, formattedPhone };
}

/**
 * 2. Verifies OTP & saves completed profile
 */
export async function verifyWhatsAppOtpAndRegister({
  formattedPhone,
  otpCode,
  fullName,
  email,
}: {
  formattedPhone: string;
  otpCode: string;
  fullName: string;
  email: string;
}) {
  // Verify OTP code entered by user
  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otpCode,
    type: 'sms',
  });

  if (verifyError || !authData.user) {
    throw new Error(verifyError?.message || 'Invalid or expired OTP code. Please check and try again.');
  }

  const userId = authData.user.id;

  // Upsert profile data in public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
      email: email,
      whatsapp_number: formattedPhone,
      is_whatsapp_verified: true,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  return { success: true, user: authData.user, session: authData.session };
}
```

---

## 🎨 5. Registration UI Workflow

```
[ Step 1: Input Form ]
  ├── Full Name
  ├── Email Address
  └── WhatsApp Mobile Number (+91)
  └── [ Button: "Send Verification Code via WhatsApp" ]
          │
          ▼ (Calls sendWhatsAppRegistrationOtp)
[ Step 2: Verification View ]
  ├── Message: "Enter the 6-digit code sent to your WhatsApp"
  ├── 6-digit OTP Input
  ├── Resend Countdown (60s)
  └── [ Button: "Verify & Complete Registration" ]
          │
          ▼ (Calls verifyWhatsAppOtpAndRegister)
[ Success ] ➔ Redirect to /dashboard
```

---

## 🛡️ 6. Error Handling & Quality Rules

1. **Dead WhatsApp Session (503)**: If your OpenWA server session disconnects, Supabase receives `503 Service Unavailable`. Catch this error on the frontend and show: *"WhatsApp verification service is currently undergoing maintenance. Please try again shortly."*
2. **Resend Cooldown**: Prevent spam by disabling the "Resend OTP" button for 60 seconds after sending.
3. **Number Formatting**: Always sanitize phone inputs using `formatPhoneNumber` before sending to Supabase to prevent invalid WhatsApp Chat ID generation (`+91XXXXXXXXXX`).
