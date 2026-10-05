import type { MessageData } from '../types/greenApi';

export function extractMessageText(data?: MessageData): string {
  if (!data) return '';

  if (data.textMessageData?.textMessage) {
    return data.textMessageData.textMessage;
  }

  if (data.textMessageData?.text) {
    return data.textMessageData.text;
  }

  if (data.extendedTextMessageData?.text) {
    return data.extendedTextMessageData.text;
  }

  if (data.typeMessage && data.typeMessage !== 'textMessage') {
    return `[${data.typeMessage}]`;
  }

  return '';
}
