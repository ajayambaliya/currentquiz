import { supabase } from '@/lib/supabase';
import { formatPhoneNumber, isValidIndianPhone } from '@/lib/phone-helper';

/**
 * 1. Sends WhatsApp OTP for new user registration
 */
export async function sendWhatsAppRegistrationOtp(rawPhone: string) {
  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો. (Please enter a valid 10-digit WhatsApp number)');
  }

  const formattedPhone = formatPhoneNumber(rawPhone);

  // Check if number already registered in profiles table
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_number', formattedPhone)
    .maybeSingle();

  if (existingUser) {
    throw new Error('આ વોટ્સએપ નંબર પહેલેથી રજિસ્ટર્ડ છે. કૃપા કરીને લોગિન કરો. (This WhatsApp number is already registered. Please log in.)');
  }

  // Trigger Supabase Phone OTP (Delivered via OpenWA WhatsApp Hook)
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    if (error.status === 503 || error.message.toLowerCase().includes('service unavailable')) {
      throw new Error('વોટ્સએપ વેરીફીકેશન સર્વિસ હાલ મેઈન્ટેનન્સમાં છે. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો. (WhatsApp service temporarily unavailable. Please try again shortly.)');
    }
    if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
      throw new Error('ઘણા બધા OTP વિનંતીઓ મોકલાયા છે. કૃપા કરીને 1 મિનિટ રાહ જુઓ. (Too many requests. Please wait 1 minute before resending OTP.)');
    }
    throw new Error(error.message || 'OTP મોકલવામાં નિષ્ફળતા મળી. કૃપા કરીને ફરી પ્રયત્ન કરો.');
  }

  return { success: true, formattedPhone };
}

/**
 * 2. Verifies OTP & creates completed user profile
 */
export async function verifyWhatsAppOtpAndRegister({
  formattedPhone,
  otpCode,
  fullName,
  email,
  password,
}: {
  formattedPhone: string;
  otpCode: string;
  fullName: string;
  email: string;
  password?: string;
}) {
  // Verify OTP code entered by user
  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otpCode,
    type: 'sms',
  });

  if (verifyError || !authData.user) {
    throw new Error(verifyError?.message || 'અમાન્ય અથવા અસ્તિત્વમાં ન હોય તેવો OTP. કૃપા કરીને સાચો OTP દાખલ કરો.');
  }

  const userId = authData.user.id;

  // Update password and email in Supabase Auth if provided
  if (email || password) {
    await supabase.auth.updateUser({
      email: email || undefined,
      password: password || undefined,
      data: {
        full_name: fullName,
      },
    }).catch(err => {
      console.warn('Non-fatal error updating auth credentials:', err);
    });
  }

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

/**
 * 3. Sends WhatsApp OTP for existing logged-in users who need verification
 */
export async function sendExistingUserWhatsAppOtp(rawPhone: string, currentUserId?: string) {
  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
  }

  const formattedPhone = formatPhoneNumber(rawPhone);

  // Check if number already used by another user
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_number', formattedPhone)
    .maybeSingle();

  if (existingUser && existingUser.id !== currentUserId) {
    throw new Error('આ વોટ્સએપ નંબર બીજા એકાઉન્ટ સાથે લિંક છે. કૃપા કરીને તમારો પોતાનો નંબર દાખલ કરો.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    if (error.status === 503 || error.message.toLowerCase().includes('service unavailable')) {
      throw new Error('વોટ્સએપ વેરીફીકેશન સર્વિસ હાલ મેઈન્ટેનન્સમાં છે. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.');
    }
    throw new Error(error.message || 'OTP મોકલવામાં નિષ્ફળતા મળી.');
  }

  return { success: true, formattedPhone };
}

/**
 * 4. Verifies OTP and marks existing user profile as WhatsApp verified
 */
export async function verifyExistingUserWhatsApp({
  formattedPhone,
  otpCode,
  userId,
  fullName,
  email,
}: {
  formattedPhone: string;
  otpCode: string;
  userId: string;
  fullName?: string;
  email?: string;
}) {
  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otpCode,
    type: 'sms',
  });

  if (verifyError) {
    throw new Error(verifyError.message || 'અમાન્ય અથવા અસ્તિત્વમાં ન હોય તેવો OTP.');
  }

  const targetUserId = userId || authData.user?.id;

  if (!targetUserId) {
    throw new Error('યુઝર ID પ્રાપ્ત થયુ નથી.');
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: targetUserId,
      whatsapp_number: formattedPhone,
      is_whatsapp_verified: true,
      full_name: fullName || authData.user?.user_metadata?.full_name || 'Student',
      email: email || authData.user?.email || null,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('Profile update error:', profileError);
    throw new Error('પ્રોફાઇલ અપડેટ કરવામાં સમસ્યા આવી.');
  }

  return { success: true };
}
