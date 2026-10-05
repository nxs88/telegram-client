import { type SubmitEvent, useState } from 'react';
import { useGreenApi } from '../../../context/GreenApiContext';
import type { Chat } from '../../../types/chat';
import { formatPhone, phoneToChatId } from '../../../utils/phone';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreateChat: (chatId: string, phone: string, name: string) => void;
  onLogout: () => void;
}

function ChatSidebar({
  chats,
  selectedChatId,
  onSelect,
  onCreateChat,
  onLogout,
}: ChatSidebarProps) {
  const { idInstance } = useGreenApi();

  const [phone, setPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [error, setError] = useState('');

  const handleCreateChat = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = phoneToChatId(phone);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onCreateChat(
      result.chatId,
      result.phone,
      newChatName.trim() || formatPhone(result.phone),
    );

    setPhone('');
    setNewChatName('');
    setError('');
  };

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__header">
        <span>Инстанс {idInstance}</span>

        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>

      <form className="chat-sidebar__new-chat" onSubmit={handleCreateChat}>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+7 999 123-45-67"
        />

        <input
          value={newChatName}
          onChange={(event) => setNewChatName(event.target.value)}
          placeholder="Имя (необязательно)"
        />

        <button type="submit" className="button">
          Создать чат
        </button>

        {error && <p className="error-text">{error}</p>}
      </form>

      <ul className="chat-sidebar__list">
        {chats.map((chat) => (
          <li
            key={chat.chatId}
            className={
              chat.chatId === selectedChatId
                ? 'chat-item chat-item--active'
                : 'chat-item'
            }
            onClick={() => onSelect(chat.chatId)}
          >
            <span className="chat-item__name">{chat.name}</span>
            <span className="chat-item__id">{chat.chatId}</span>
          </li>
        ))}
      </ul>

      {chats.length === 0 && (
        <p className="chat-sidebar__empty">
          Чатов пока нет. Создайте чат или попросите собеседника написать первым
          — тогда чат появится сам.
        </p>
      )}
    </aside>
  );
}

export default ChatSidebar;
