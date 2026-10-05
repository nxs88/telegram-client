import { useCallback, useReducer, useState } from 'react';
import { useGreenApi } from '../../context/GreenApiContext';
import { useNotifications } from '../../hooks/useNotifications';
import type { Chat, ChatMessage } from '../../types/chat';
import { extractMessageText } from '../../utils/extractMessage';
import type { Notification } from '../../types/greenApi';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';

interface ChatsState {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
}

type ChatsAction =
  | {
      type: 'chat/created';
      chatId: string;
      phone: string;
      name: string;
    }
  | { type: 'message/upserted'; message: ChatMessage };

const initialChatsState: ChatsState = { chats: [], messages: {} };

function chatsReducer(state: ChatsState, action: ChatsAction): ChatsState {
  switch (action.type) {
    case 'chat/created': {
      if (state.chats.some((chat) => chat.phone === action.phone)) {
        return state;
      }

      return {
        ...state,
        chats: [
          ...state.chats,
          {
            chatId: action.chatId,
            phone: action.phone,
            name: action.name,
          },
        ],
      };
    }

    case 'message/upserted': {
      const { message } = action;
      const chatMessages = state.messages[message.chatId] ?? [];

      if (chatMessages.some((m) => m.idMessage === message.idMessage)) {
        return state;
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message],
        },
      };
    }

    default:
      return state;
  }
}

const MESSAGE_WEBHOOK_TYPES = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived',
]);

interface ChatPageProps {
  onLogout: () => void;
}

function ChatPage({ onLogout }: ChatPageProps) {
  const { client } = useGreenApi();

  const [chatsState, dispatch] = useReducer(chatsReducer, initialChatsState);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleNotification = useCallback(
    (notification: Notification) => {
      const { body } = notification;

      if (!MESSAGE_WEBHOOK_TYPES.has(body.typeWebhook)) {
        return;
      }

      if (!body.senderData) {
        return;
      }

      const text = extractMessageText(body.messageData);

      if (!text) {
        return;
      }

      const senderPhone = body.senderData.senderPhoneNumber
        ? String(body.senderData.senderPhoneNumber)
        : '';

      const existingChat = senderPhone
        ? chatsState.chats.find((chat) => chat.phone === senderPhone)
        : undefined;

      const chatId = existingChat?.chatId ?? body.senderData.chatId;
      const chatName = existingChat?.name ?? body.senderData.chatName ?? chatId;

      dispatch({
        type: 'chat/created',
        chatId,
        phone: senderPhone || body.senderData.chatId,
        name: chatName,
      });

      dispatch({
        type: 'message/upserted',
        message: {
          idMessage: body.idMessage,
          chatId,
          text,
          timestamp: body.timestamp * 1000,
          direction:
            body.typeWebhook === 'incomingMessageReceived'
              ? 'incoming'
              : 'outgoing',
        },
      });

      setSelectedChatId((previous) => previous ?? chatId);
    },
    [chatsState.chats],
  );

  useNotifications(handleNotification);

  const handleCreateChat = useCallback(
    (chatId: string, phone: string, name: string) => {
      dispatch({
        type: 'chat/created',
        chatId,
        phone,
        name,
      });

      setSelectedChatId(chatId);
    },
    [],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedChatId) return;

      setSendError(null);

      try {
        const { idMessage } = await client.sendMessage(selectedChatId, text);

        dispatch({
          type: 'message/upserted',
          message: {
            idMessage,
            chatId: selectedChatId,
            text,
            timestamp: Date.now(),
            direction: 'outgoing',
          },
        });
      } catch (error) {
        console.error('sendMessage error:', error);
        setSendError('Не удалось отправить сообщение');

        throw error;
      }
    },
    [client, selectedChatId],
  );

  const selectedChat =
    chatsState.chats.find((chat) => chat.chatId === selectedChatId) ?? null;

  const selectedMessages = selectedChatId
    ? (chatsState.messages[selectedChatId] ?? [])
    : [];

  return (
    <div className="chat-page">
      <ChatSidebar
        chats={chatsState.chats}
        selectedChatId={selectedChatId}
        onSelect={setSelectedChatId}
        onCreateChat={handleCreateChat}
        onLogout={onLogout}
      />

      <ChatWindow
        chat={selectedChat}
        messages={selectedMessages}
        sendError={sendError}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default ChatPage;
