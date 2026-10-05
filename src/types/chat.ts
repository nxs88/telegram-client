export interface Chat {
  chatId: string;
  name: string;
  phone: string;
}

export interface ChatMessage {
  idMessage: string;
  chatId: string;
  text: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
}
