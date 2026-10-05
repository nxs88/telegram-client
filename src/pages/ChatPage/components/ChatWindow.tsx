import { useEffect, useRef } from 'react';
import type { Chat, ChatMessage } from '../../../types/chat';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  chat: Chat | null;
  messages: ChatMessage[];
  sendError: string | null;
  onSendMessage: (text: string) => Promise<void>;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ChatWindow({
  chat,
  messages,
  sendError,
  onSendMessage,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages, chat?.chatId]);

  if (!chat) {
    return (
      <section className="chat-window chat-window--empty">
        <p>Выберите чат слева или создайте новый</p>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header className="chat-window__header">
        <h2>{chat.name}</h2>
        <span className="chat-window__chat-id">{chat.chatId}</span>
      </header>

      <div className="chat-window__messages">
        {messages.map((message) => (
          <div
            key={message.idMessage}
            className={`message message--${message.direction}`}
          >
            <p className="message__text">{message.text}</p>
            <span className="message__time">
              {formatTime(message.timestamp)}
            </span>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {sendError && <p className="chat-window__error">{sendError}</p>}

      <MessageInput onSend={onSendMessage} />
    </section>
  );
}

export default ChatWindow;
