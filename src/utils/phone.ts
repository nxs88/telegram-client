const CHAT_ID_SUFFIX = '@c.us';
const MIN_PHONE_DIGITS = 11;
const MAX_PHONE_DIGITS = 15;

export type PhoneToChatIdResult =
  | { ok: true; phone: string; chatId: string }
  | { ok: false; error: string };

export function phoneToChatId(input: string): PhoneToChatIdResult {
  let digits = input.replace(/\D/g, '');

  if (!digits) {
    return { ok: false, error: 'Введите номер телефона' };
  }

  if (digits.length === MIN_PHONE_DIGITS && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }

  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return {
      ok: false,
      error: `Номер должен содержать от ${MIN_PHONE_DIGITS} до ${MAX_PHONE_DIGITS} цифр, включая код страны (например, 79991234567)`,
    };
  }

  return {
    ok: true,
    phone: digits,
    chatId: `${digits}${CHAT_ID_SUFFIX}`,
  };
}

export function formatPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }

  return `+${digits}`;
}
