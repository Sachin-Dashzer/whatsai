export function normalizePhone(raw) {
  if (!raw) throw new Error('Phone number is required');
  const digits = raw.replace(/\D/g, '');

  // India: 10 digits → prepend 91
  if (digits.length === 10) return '91' + digits;

  // Already has country code
  if (digits.length >= 11) return digits;

  throw new Error(`Invalid phone number "${raw}" — must include country code (e.g. 919876543210 for India)`);
}
