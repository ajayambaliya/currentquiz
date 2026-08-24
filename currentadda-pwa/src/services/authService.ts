import { supabase } from '@/lib/supabase';
import { formatPhoneNumber, isValidIndianPhone } from '@/lib/phone-helper';

function formatAuthError(error: any, defaultMsg: string): string {
  if (!error) return defaultMsg;
  const msg = (error.message || '').toLowerCase();
  const code = (error.code || error.error_code || '').toLowerCase();

  if (error.status === 503 || msg.includes('service unavailable') || code.includes('503')) {
    return 'વોટ્સએપ વેરીફીકેશન સર્વિસ હાલ મેઈન્ટેનન્સમાં છે. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.';
  }
  if (error.status === 429 || msg.includes('rate limit') || msg.includes('too many') || code.includes('rate_limit')) {
    return 'ઘણા બધા OTP વિનંતીઓ મોકલાયા છે. કૃપા કરીને 1 મિનિટ રાહ જુઓ.';
  }
  if (msg.includes('hook') || msg.includes('timeout') || code.includes('hook_timeout')) {
    return 'સર્વર પ્રતિસાદમાં થોડો સમય લાગી રહ્યો છે. કૃપા કરીને થોડી સેકન્ડ રાહ જોઈ ફરી પ્રયત્ન કરો.';
  }
  return error.message || defaultMsg;
}

/**
 * 1. Sends WhatsApp OTP for new user registration
 */
export async function sendWhatsAppRegistrationOtp(rawPhone: string) {
  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
  }

  const formattedPhone = formatPhoneNumber(rawPhone);

  // Check if number already registered in profiles table
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_number', formattedPhone)
    .maybeSingle();

  if (existingUser) {
    throw new Error('આ વોટ્સએપ નંબર પહેલેથી રજિસ્ટર્ડ છે. કૃપા કરીને લોગિન કરો.');
  }

  // Trigger Supabase Phone OTP (Delivered via OpenWA WhatsApp Hook)
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(formatAuthError(error, 'OTP મોકલવામાં નિષ્ફળતા મળી. કૃપા કરીને ફરી પ્રયત્ન કરો.'));
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
  // 1. Verify OTP code entered by user
  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otpCode.trim(),
    type: 'sms',
  });

  if (verifyError || !authData.user) {
    throw new Error(verifyError?.message || 'અમાન્ય અથવા એક્સપાયર થયેલ OTP કોડ. કૃપા કરીને સાચો OTP દાખલ કરો.');
  }

  const userId = authData.user.id;

  // 2. Set password for user credentials if provided
  if (password) {
    try {
      await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName,
        },
      });
    } catch (passErr) {
      console.warn('Notice: Non-fatal password update warning:', passErr);
    }
  }

  // 3. Upsert profile data in public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName.trim(),
      email: email ? email.trim() : null,
      whatsapp_number: formattedPhone,
      is_whatsapp_verified: true,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('Profile upsert warning:', profileError);
  }

  return { success: true, user: authData.user, session: authData.session };
}

/**
 * 3. Universal Login with Phone Number (+91) OR Email + Password
 */
export async function loginWithPhoneOrEmail({
  identifier,
  password,
}: {
  identifier: string;
  password: string;
}) {
  const trimmed = identifier.trim();

  // If user entered a 10-digit phone number or +91 number
  if (isValidIndianPhone(trimmed)) {
    const formattedPhone = formatPhoneNumber(trimmed);
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password: password,
    });

    if (error) {
      throw new Error(error.message === 'Invalid login credentials' 
        ? 'મોબાઇલ નંબર અથવા પાસવર્ડ ખોટો છે.' 
        : error.message);
    }

    return data;
  }

  // Otherwise authenticate with Email
  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmed,
    password: password,
  });

  if (error) {
    throw new Error(error.message === 'Invalid login credentials' 
      ? 'ઈમેલ અથવા પાસવર્ડ ખોટો છે.' 
      : error.message);
  }

  return data;
}

/**
 * 4. Sends 1-Click WhatsApp Login OTP (Passwordless Login)
 */
export async function sendWhatsAppLoginOtp(rawPhone: string) {
  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
  }

  const formattedPhone = formatPhoneNumber(rawPhone);

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_number', formattedPhone)
    .maybeSingle();

  if (!existingUser) {
    throw new Error('આ વોટ્સએપ નંબર રજિસ્ટર્ડ નથી. કૃપા કરીને પહેલા રજિસ્ટ્રેશન કરો.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    throw new Error(formatAuthError(error, 'OTP મોકલવામાં નિષ્ફળતા મળી.'));
  }

  return { success: true, formattedPhone };
}

/**
 * 5. Verifies 1-Click WhatsApp Login OTP
 */
export async function verifyWhatsAppLoginOtp(formattedPhone: string, otpCode: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otpCode.trim(),
    type: 'sms',
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'અમાન્ય અથવા એક્સપાયર થયેલ OTP.');
  }

  return data;
}

/**
 * 6. Sends WhatsApp Password Reset OTP
 */
export async function sendWhatsAppPasswordResetOtp(rawPhone: string) {
  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ નંબર દાખલ કરો.');
  }

  const formattedPhone = formatPhoneNumber(rawPhone);

  // Check if number is registered
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_number', formattedPhone)
    .maybeSingle();

  if (!userProfile) {
    throw new Error('આ વોટ્સએપ નંબર રજિસ્ટર્ડ નથી. કૃપા કરીને સાચો નંબર દાખલ કરો.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    throw new Error(formatAuthError(error, 'પાસવર્ડ રીસેટ OTP મોકલવામાં સમસ્યા આવી.'));
  }

  return { success: true, formattedPhone };
}

/**
 * 7. Verifies WhatsApp OTP and updates user password
 */
export async function verifyWhatsAppOtpAndResetPassword({
  formattedPhone,
  otpCode,
  newPassword,
}: {
  formattedPhone: string;
  otpCode: string;
  newPassword: string;
}) {
  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otpCode.trim(),
    type: 'sms',
  });

  if (verifyError || !authData.user) {
    throw new Error(verifyError?.message || 'અમાન્ય અથવા એક્સપાયર થયેલ OTP.');
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message || 'પાસવર્ડ અપડેટ કરવામાં નિષ્ફળતા મળી.');
  }

  return { success: true, user: authData.user };
}

/**
 * 8. Sends WhatsApp OTP for existing logged-in users
 */
export async function sendExistingUserWhatsAppOtp(rawPhone: string, currentUserId?: string) {
  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
  }

  const formattedPhone = formatPhoneNumber(rawPhone);

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
    throw new Error(formatAuthError(error, 'OTP મોકલવામાં નિષ્ફળતા મળી.'));
  }

  return { success: true, formattedPhone };
}

/**
 * 9. Verifies OTP and marks existing user profile as WhatsApp verified
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
    token: otpCode.trim(),
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
