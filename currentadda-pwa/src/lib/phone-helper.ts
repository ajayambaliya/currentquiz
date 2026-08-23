/**
 * Normalizes Indian 10-digit phone numbers to E.164 format (+91XXXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = `91${cleaned.slice(1)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already has 91 prefix
  } else if (cleaned.startsWith('0091')) {
    cleaned = cleaned.slice(2);
  }
  
  return `+${cleaned}`;
}

/**
 * Validates whether a given phone string is a valid 10-digit Indian mobile number
 */
export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return /^[6-9]\d{9}$/.test(cleaned.slice(1));
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(cleaned.slice(2));
  }
  
  return false;
}

/**
 * Formats E.164 phone number into human readable +91 XXXXX XXXXX format
 */
export function displayPhoneNumber(phone: string): string {
  if (!phone) return '';
  const formatted = formatPhoneNumber(phone);
  const digits = formatted.replace(/\D/g, '');
  
  if (digits.length === 12 && digits.startsWith('91')) {
    const mainNumber = digits.slice(2);
    return `+91 ${mainNumber.slice(0, 5)} ${mainNumber.slice(5)}`;
  }
  
  return formatted;
}
