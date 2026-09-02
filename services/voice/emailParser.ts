/**
 * Spoken Email Address Normalizer
 * Converts natural spoken email phrases into standard email format.
 * Examples:
 *   "rahul at gmail dot com" -> "rahul@gmail.com"
 *   "parv dot kajla at gmail dot com" -> "parv.kajla@gmail.com"
 *   "rahul dash sharma at yahoo dot co dot in" -> "rahul-sharma@yahoo.co.in"
 */
export function parseSpokenEmail(rawSpeech: string): string {
  if (!rawSpeech) return '';

  let text = rawSpeech.toLowerCase().trim();

  // Common spoken replacements
  text = text.replace(/\s+at\s+/g, '@');
  text = text.replace(/\s+dot\s+/g, '.');
  text = text.replace(/\s+dash\s+/g, '-');
  text = text.replace(/\s+hyphen\s+/g, '-');
  text = text.replace(/\s+underscore\s+/g, '_');
  text = text.replace(/\s+plus\s+/g, '+');

  // Spoken number words
  const numMap: { [key: string]: string } = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9'
  };
  Object.keys(numMap).forEach(word => {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(reg, numMap[word]);
  });

  // Handle cases where speech engine formats "at" as symbol or without spaces
  text = text.replace(/at\s+gmail/g, '@gmail');
  text = text.replace(/at\s+yahoo/g, '@yahoo');
  text = text.replace(/at\s+outlook/g, '@outlook');
  text = text.replace(/at\s+hotmail/g, '@hotmail');
  text = text.replace(/at\s+icloud/g, '@icloud');

  // Remove remaining spaces
  text = text.replace(/\s+/g, '');

  // Strip trailing punctuation
  text = text.replace(/[.,;!?]+$/, '');

  return text;
}

/**
 * Validates if string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
