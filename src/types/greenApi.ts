export interface GetStateInstanceResponse {
  stateInstance:
    | 'notAuthorized'
    | 'authorized'
    | 'blocked'
    | 'suspended'
    | 'starting'
    | 'pendingPassword';
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface SenderData {
  chatId: string;
  chatName?: string;
  senderId?: string;
  senderName?: string;
  senderPhoneNumber?: string;
}

export interface MessageData {
  typeMessage?: string;
  textMessageData?: { textMessage?: string; text?: string };
  extendedTextMessageData?: { text?: string };
}

export interface NotificationBody {
  typeWebhook: string;
  idMessage: string;
  timestamp: number;
  senderData?: SenderData;
  messageData?: MessageData;
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}

export interface SetSettingsResponse {
  saveSettings: boolean;
}
