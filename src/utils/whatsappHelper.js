/**
 * Generates a WhatsApp link for a given phone number and optional message.
 * @param {string} phone - The phone number (with or without formatting).
 * @param {string} [message] - Optional message to pre-fill.
 * @returns {string} - The formatted wa.me link.
 */
export const getWhatsappLink = (phone, message = '') => {
  if (!phone) return '#';
  
  // Remove non-digits
  const cleanPhone = phone.toString().replace(/\D/g, '');
  
  if (!cleanPhone) return '#';

  // Default to Brazil country code (55) if not present and number looks like a local number (8-11 digits)
  // Standard Brazilian numbers: (DDD) 9XXXX-XXXX (11 digits) or (DDD) XXXX-XXXX (10 digits)
  let finalPhone = cleanPhone;
  if (cleanPhone.length >= 8 && cleanPhone.length <= 11 && !cleanPhone.startsWith('55')) {
    finalPhone = `55${cleanPhone}`;
  }
  
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${finalPhone}${encodedMessage}`;
};
