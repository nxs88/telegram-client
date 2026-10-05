import axios from 'axios';

import type {
  GetStateInstanceResponse,
  Notification,
  SendMessageResponse,
  SetSettingsResponse,
} from '../types/greenApi';

export interface GreenApiConfig {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export class GreenApiClient {
  private readonly apiUrl: string;
  private readonly idInstance: string;
  private readonly apiTokenInstance: string;

  constructor(config: GreenApiConfig) {
    this.apiUrl = config.apiUrl;
    this.idInstance = config.idInstance;
    this.apiTokenInstance = config.apiTokenInstance;
  }

  private getEndpoint(method: string): string {
    return (
      `${this.apiUrl}/waInstance` +
      `${this.idInstance}/${method}/` +
      `${this.apiTokenInstance}`
    );
  }

  async getStateInstance(): Promise<GetStateInstanceResponse> {
    const response = await axios.get<GetStateInstanceResponse>(
      this.getEndpoint('getStateInstance'),
    );
    return response.data;
  }

  async sendMessage(
    chatId: string,
    message: string,
  ): Promise<SendMessageResponse> {
    const response = await axios.post<SendMessageResponse>(
      this.getEndpoint('sendMessage'),
      { chatId, message },
    );

    return response.data;
  }

  async receiveNotification(
    signal?: AbortSignal,
  ): Promise<Notification | null> {
    const response = await axios.get<Notification | null>(
      this.getEndpoint('receiveNotification'),
      {
        params: {
          receiveTimeout: 30,
        },
        timeout: 35_000,
        signal,
      },
    );

    const data = response.data;

    return typeof data === 'object' && data !== null ? data : null;
  }

  async deleteNotification(receiptId: number): Promise<boolean> {
    const response = await axios.delete<boolean>(
      `${this.getEndpoint('deleteNotification')}/${receiptId}`,
    );

    return response.data;
  }
  async setSettings(): Promise<SetSettingsResponse> {
    const response = await axios.post<SetSettingsResponse>(
      this.getEndpoint('setSettings'),
      {
        webhookUrl: '',
        webhookUrlToken: '',
        incomingWebhook: 'yes',

        outgoingWebhook: 'no',
        outgoingMessageWebhook: 'no',
        outgoingAPIMessageWebhook: 'no',
        stateWebhook: 'no',

        markIncomingMessagesReaded: 'no',
        markIncomingMessagesReadedOnReply: 'no',
      },
    );

    return response.data;
  }
}
