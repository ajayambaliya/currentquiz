-- CurrentAdda PWA - Supabase Auth & Profile Consistency Migration
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Ensure public.profiles table exists with all standard columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Candidate',
  email TEXT,
  whatsapp_number TEXT UNIQUE,
  is_whatsapp_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns safely if table already existed
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS is_whatsapp_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;

-- 3. Data Cleanup & Standardization: Strip non-digits and normalize to 12-digit Indian format (91XXXXXXXXXX)
UPDATE public.profiles
SET whatsapp_number = regexp_replace(whatsapp_number, '\D', '', 'g')
WHERE whatsapp_number IS NOT NULL AND whatsapp_number ~ '\D';

UPDATE public.profiles
SET whatsapp_number = '91' || whatsapp_number
WHERE whatsapp_number IS NOT NULL 
  AND length(whatsapp_number) = 10 
  AND whatsapp_number ~ '^[6-9]';

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON public.profiles(streak_count DESC);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read of profiles (required for leaderboard, user discovery, and lookup)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 6. Helper View for Admin / Auth Diagnostics (Accessible by service_role)
CREATE OR REPLACE VIEW public.auth_users_diagnostic AS
SELECT 
  u.id AS auth_user_id,
  u.phone,
  u.email AS auth_email,
  u.phone_confirmed_at,
  u.email_confirmed_at,
  u.created_at AS auth_created_at,
  p.full_name,
  p.whatsapp_number AS profile_phone,
  p.is_whatsapp_verified,
  p.email AS profile_email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
