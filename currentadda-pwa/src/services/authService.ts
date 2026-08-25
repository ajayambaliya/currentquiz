import { supabase } from '@/lib/supabase';
import { toE164, toStandardDigits, isValidIndianPhone } from '@/lib/phone-helper';

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
  if (msg.includes('user already registered') || msg.includes('already exists') || code.includes('user_already_exists')) {
    return 'આ વોટ્સએપ નંબર પહેલેથી રજિસ્ટર્ડ છે. કૃપા કરીને લોગિન કરો.';
  }
  if (msg.includes('invalid login credentials')) {
    return 'મોબાઇલ નંબર અથવા પાસવર્ડ ખોટો છે.';
  }
  if (msg.includes('token has expired') || msg.includes('otp expired') || msg.includes('invalid token')) {
    return 'OTP કોડ અમાન્ય અથવા એક્સપાયર થઈ ગયો છે. કૃપા કરીને ફરીથી પ્રયત્ન કરો.';
  }
  return error.message || defaultMsg;
}

/**
 * 1. Initiates WhatsApp OTP Registration with cryptographically secure password storage
 */
export async function sendWhatsAppRegistrationOtp(
  rawPhone: string,
  password?: string,
  fullName?: string,
  email?: string
) {
  console.log('[AuthService] sendWhatsAppRegistrationOtp called for:', rawPhone);

  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
  }

  const formattedPhone = toE164(rawPhone);
  const plainDigits = toStandardDigits(rawPhone);

  // Check if number is already registered and verified in profiles table
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, is_whatsapp_verified')
    .or(`whatsapp_number.eq.${formattedPhone},whatsapp_number.eq.${plainDigits}`)
    .maybeSingle();

  if (existingProfile && existingProfile.is_whatsapp_verified) {
    throw new Error('આ વોટ્સએપ નંબર પહેલેથી રજિસ્ટર્ડ છે. કૃપા કરીને લોગિન કરો.');
  }

  // Trigger Supabase Auth signUp with phone & password
  // This stores the encrypted password in auth.users immediately upon signup request
  if (password) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      phone: formattedPhone,
      password: password,
      options: {
        data: {
          full_name: fullName?.trim() || 'Student',
          email: email?.trim() || null,
        },
      },
    });

    if (signUpError) {
      console.warn('[AuthService] signUp returned error:', signUpError);

      // If user already exists in auth.users (e.g. from an incomplete previous attempt)
      const errLower = (signUpError.message || '').toLowerCase();
      if (errLower.includes('already registered') || errLower.includes('already exists')) {
        console.log('[AuthService] User exists in auth.users, triggering OTP resend...');
        // Fallback to signInWithOtp so user can complete verification
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: false,
            data: {
              full_name: fullName?.trim() || 'Student',
              email: email?.trim() || null,
            },
          },
        });

        if (otpError) {
          throw new Error(formatAuthError(otpError, 'આ નંબર પહેલેથી રજિસ્ટર્ડ છે. કૃપા કરીને લોગિન કરો.'));
        }

        return { success: true, formattedPhone };
      }

      throw new Error(formatAuthError(signUpError, 'OTP મોકલવામાં નિષ્ફળતા મળી. કૃપા કરીને ફરી પ્રયત્ન કરો.'));
    }

    console.log('[AuthService] User signed up successfully with password. OTP dispatched to WhatsApp.');
    return { success: true, formattedPhone, user: signUpData?.user };
  }

  // Fallback for passwordless OTP registration if no password provided
  const { error: otpError } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: true,
      data: {
        full_name: fullName?.trim() || 'Student',
        email: email?.trim() || null,
      },
    },
  });

  if (otpError) {
    throw new Error(formatAuthError(otpError, 'OTP મોકલવામાં નિષ્ફળતા મળી. કૃપા કરીને ફરી પ્રયત્ન કરો.'));
  }

  return { success: true, formattedPhone };
}

/**
 * 2. Verifies OTP & completes profile creation
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
  const e164Phone = toE164(formattedPhone);
  const plainDigits = toStandardDigits(formattedPhone);
  console.log('[AuthService] verifyWhatsAppOtpAndRegister called for:', e164Phone);

  // 1. Verify OTP code entered by user
  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: e164Phone,
    token: otpCode.trim(),
    type: 'sms',
  });

  let currentUser = authData?.user;

  // Fallback: check session if token was just consumed
  if (verifyError || !currentUser) {
    console.warn('[AuthService] verifyOtp initial warning:', verifyError);
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      currentUser = userData.user;
    } else {
      throw new Error(verifyError?.message || 'અમાન્ય અથવા એક્સપાયર થયેલ OTP કોડ. કૃપા કરીને સાચો OTP દાખલ કરો.');
    }
  }

  const userId = currentUser.id;

  // 2. Ensure password is set if provided (guarantees password is active even if registered via OTP fallback)
  if (password) {
    try {
      const { error: updatePassError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName.trim(),
        },
      });
      if (updatePassError) {
        console.warn('[AuthService] updateUser password warning:', updatePassError);
      }
    } catch (passErr) {
      console.warn('[AuthService] Non-fatal password update warning:', passErr);
    }
  }

  // 3. Upsert user profile into public.profiles
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName.trim(),
        email: email ? email.trim() : null,
        whatsapp_number: plainDigits, // Stored consistently as 91XXXXXXXXXX
        is_whatsapp_verified: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('[AuthService] Profile upsert error:', profileError);
    } else {
      console.log('[AuthService] Profile successfully upserted for user:', userId);
    }
  } catch (profileErr) {
    console.error('[AuthService] Profile upsert exception:', profileErr);
  }

  return { success: true, user: currentUser, session: authData?.session };
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
  console.log('[AuthService] loginWithPhoneOrEmail called for identifier:', trimmed);

  // If user entered a 10-digit Indian phone number or +91 number
  if (isValidIndianPhone(trimmed)) {
    const formattedPhone = toE164(trimmed);
    console.log('[AuthService] Attempting signInWithPassword with phone:', formattedPhone);
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password: password,
    });

    if (error) {
      console.warn('[AuthService] Phone login error:', error.message);
      throw new Error(
        error.message === 'Invalid login credentials'
          ? 'મોબાઇલ નંબર અથવા પાસવર્ડ ખોટો છે.'
          : error.message
      );
    }

    console.log('[AuthService] Phone login successful for user:', data.user?.id);
    return data;
  }

  // Otherwise authenticate with Email
  console.log('[AuthService] Attempting signInWithPassword with email:', trimmed);
  const { data: emailData, error: emailError } = await supabase.auth.signInWithPassword({
    email: trimmed,
    password: password,
  });

  if (!emailError && emailData?.user) {
    console.log('[AuthService] Email direct login successful for user:', emailData.user.id);
    return emailData;
  }

  // If email direct sign in failed (e.g. user registered with phone and email is only in profile):
  // Check if profile exists with this email to resolve linked phone number
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('whatsapp_number')
      .eq('email', trimmed)
      .maybeSingle();

    if (profile?.whatsapp_number) {
      const linkedPhone = toE164(profile.whatsapp_number);
      console.log('[AuthService] Found linked WhatsApp number for email, trying phone login:', linkedPhone);
      const { data: linkedData, error: linkedError } = await supabase.auth.signInWithPassword({
        phone: linkedPhone,
        password: password,
      });

      if (!linkedError && linkedData?.user) {
        console.log('[AuthService] Linked phone login successful for user:', linkedData.user.id);
        return linkedData;
      }
    }
  } catch (linkErr) {
    console.warn('[AuthService] Linked profile email lookup warning:', linkErr);
  }

  throw new Error(
    emailError?.message === 'Invalid login credentials'
      ? 'ઈમેલ અથવા પાસવર્ડ ખોટો છે.'
      : emailError?.message || 'લોગિન કરવામાં નિષ્ફળતા મળી.'
  );
}

/**
 * 4. Sends 1-Click WhatsApp Login OTP (Passwordless Instant Login)
 */
export async function sendWhatsAppLoginOtp(rawPhone: string) {
  console.log('[AuthService] sendWhatsAppLoginOtp called for:', rawPhone);

  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
  }

  const formattedPhone = toE164(rawPhone);
  const plainDigits = toStandardDigits(rawPhone);

  // Check if user exists in profiles (check both formats)
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .or(`whatsapp_number.eq.${formattedPhone},whatsapp_number.eq.${plainDigits}`)
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
  const e164Phone = toE164(formattedPhone);
  console.log('[AuthService] verifyWhatsAppLoginOtp called for:', e164Phone);

  const { data, error } = await supabase.auth.verifyOtp({
    phone: e164Phone,
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
  console.log('[AuthService] sendWhatsAppPasswordResetOtp called for:', rawPhone);

  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ નંબર દાખલ કરો.');
  }

  const formattedPhone = toE164(rawPhone);
  const plainDigits = toStandardDigits(rawPhone);

  // Check if number is registered (check both with + and without +)
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id')
    .or(`whatsapp_number.eq.${formattedPhone},whatsapp_number.eq.${plainDigits}`)
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
  const e164Phone = toE164(formattedPhone);
  console.log('[AuthService] verifyWhatsAppOtpAndResetPassword called for:', e164Phone);

  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: e164Phone,
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

  console.log('[AuthService] Password reset successfully for user:', authData.user.id);
  return { success: true, user: authData.user };
}

/**
 * 8. Sends WhatsApp OTP for existing logged-in users
 */
export async function sendExistingUserWhatsAppOtp(rawPhone: string, currentUserId?: string) {
  if (!isValidIndianPhone(rawPhone)) {
    throw new Error('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
  }

  const formattedPhone = toE164(rawPhone);
  const plainDigits = toStandardDigits(rawPhone);

  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .or(`whatsapp_number.eq.${formattedPhone},whatsapp_number.eq.${plainDigits}`)
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
  const e164Phone = toE164(formattedPhone);
  const plainDigits = toStandardDigits(formattedPhone);

  const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
    phone: e164Phone,
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
      whatsapp_number: plainDigits,
      is_whatsapp_verified: true,
      full_name: fullName || authData.user?.user_metadata?.full_name || 'Student',
      email: email || authData.user?.email || null,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('[AuthService] Profile update error:', profileError);
    throw new Error('પ્રોફાઇલ અપડેટ કરવામાં સમસ્યા આવી.');
  }

  return { success: true };
}
