/**
 * Normalizes any Indian phone number representation to standard 12-digit format without plus (e.g. 919876543210)
 * Used for database storage and OpenWA Chat ID generation.
 */
export function toStandardDigits(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = `91${cleaned.slice(1)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already 12-digit with 91 prefix
  } else if (cleaned.startsWith('0091')) {
    cleaned = cleaned.slice(2);
  }

  return cleaned;
}

/**
 * Normalizes Indian phone numbers to E.164 format (+91XXXXXXXXXX)
 * Used for Supabase Auth API calls (signUp, signInWithPassword, signInWithOtp, verifyOtp).
 */
export function toE164(phone: string): string {
  const digits = toStandardDigits(phone);
  return digits ? `+${digits}` : '';
}

/**
 * Standard alias for toE164 (backward compatibility)
 */
export function formatPhoneNumber(phone: string): string {
  return toE164(phone);
}

/**
 * Extracts raw 10-digit Indian mobile number (e.g. 9876543210)
 */
export function to10Digits(phone: string): string {
  const digits = toStandardDigits(phone);
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

/**
 * Validates whether a given phone string is a valid Indian mobile number (starts with 6, 7, 8, or 9)
 */
export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = toStandardDigits(phone);
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  return false;
}

/**
 * Formats phone number into human readable +91 XXXXX XXXXX format
 */
export function displayPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = toStandardDigits(phone);
  if (digits.length === 12 && digits.startsWith('91')) {
    const main = digits.slice(2);
    return `+91 ${main.slice(0, 5)} ${main.slice(5)}`;
  }
  return phone;
}

